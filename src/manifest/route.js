const CONST_BEFORE_ACTION = "before";
const CONST_AFTER_ACTION = "after";

const obsoleteWarning = require("../obsolete");
const Auth = require("../auth"),
    HttpError = require("../error").Http;

const { objHas, copyObj, executeObjectFunction } = require("../common");

/**
 *	Route representation
 *	@class
 *	@param	{object}	notApp		notApplication instance
 *	@param	{string}	moduleName	name of owner module
 *	@param	{string}	routeName	route name
 *	@param	{string}	actionName	action name
 *	@param	{object}	actionData	action data
 **/
class notRoute {
    constructor(notApp, moduleName, routeName, actionName, actionData) {
        this.notApp = notApp;
        this.routeName = routeName;
        this.moduleName = moduleName;
        this.actionName = actionName;
        this.actionData = actionData;
        return this;
    }

    /**
     * Cycle throu rules of action and checking user credentials against them
     * If user creds comply to some rule - returns copy of rule
     * @param {object}   action    action rules object
     * @param {object}   user      user credentials (auth, role, root)
     * @return {object|null}       returns rule or null
     **/
    static actionAvailableByRule(action, user) {
        if (!action) {
            return null;
        }
        if (Array.isArray(action.rules) && action.rules.length > 0) {
            return notRoute.cycleThruRules(action.rules, user);
        } else {
            if (
                Auth.checkCredentials(action, user.auth, user.role, user.root)
            ) {
                return copyObj(action);
            }
        }
        return null;
    }

    static cycleThruRules(rules, user, url = "") {
        for (let i = 0; i < rules.length; i++) {
            obsoleteWarning(rules[i], url);
            if (
                Auth.checkCredentials(rules[i], user.auth, user.role, user.root)
            ) {
                return copyObj(rules[i]);
            }
        }
        return null;
    }

    /**
     *	Select rule from available or return null
     *	@param	{object}	req 	Express Request Object
     *	@return	{object}	rule or null
     */
    selectRule(req) {
        const user = Auth.extractAuthData(req);
        if (this.actionData) {
            return notRoute.actionAvailableByRule(this.actionData, user);
        }
        return null;
    }

    setRequestRouteData(req, actionName, rule) {
        req.notRouteData = {
            actionName,
            rule: copyObj(rule),
            actionData: copyObj(this.actionData),
        };
    }

    /**
     *	Executes route action if such exist
     *	@param	{object}	req 	Express Request Object
     *	@param	{object}	res		Express Response Object
     *	@param	{function}	callback
     *	@return {object}	result of execution or HttpError
     **/
    exec(req, res, next) {
        try {
            let rule = this.selectRule(req);
            if (!rule) {
                return next(
                    new HttpError(
                        403,
                        [
                            "rule for router not found",
                            this.moduleName,
                            this.routeName,
                        ].join("; ")
                    )
                );
            }
            obsoleteWarning(rule, req.originalUrl);
            let actionName = this.selectActionName(rule);
            let mod = this.notApp.getModule(this.moduleName);
            if (!mod) {
                return next(
                    new HttpError(
                        404,
                        [
                            "module not found",
                            this.moduleName,
                            this.routeName,
                            actionName,
                        ].join("; ")
                    )
                );
            }
            let modRoute = mod.getRoute(this.routeName);
            this.setRequestRouteData(req, actionName, rule);
            if (this.routeIsRunnable(modRoute, actionName)) {
                return this.executeRoute(modRoute, actionName, {
                    req,
                    res,
                    next,
                });
            } else {
                return next(
                    new HttpError(
                        404,
                        [
                            "route not found",
                            this.moduleName,
                            this.routeName,
                            actionName,
                        ].join("; ")
                    )
                );
            }
        } catch (e) {
            this.notApp.report(e);
        }
    }

    selectActionName(rule) {
        let realActionName = this.actionName;
        if (rule.actionPrefix) {
            realActionName = rule.actionPrefix + realActionName;
        } else {
            if (rule.actionName) {
                realActionName = rule.actionName;
            } else {
                if (rule.root || rule.admin /*obsolete*/) {
                    realActionName = "_" + realActionName;
                }
            }
        }
        return realActionName;
    }

    routeIsRunnable(modRoute, actionName) {
        return (
            modRoute &&
            //objHas(modRoute, actionName) && // -- not working on static classes methods
            typeof modRoute[actionName] === "function"
        );
    }

    extractReturn(notRouteData) {
        if (objHas(notRouteData.rule, "return")) {
            return [...notRouteData.rule.return];
        } else if (objHas(notRouteData.actionData, "return")) {
            return [...notRouteData.actionData.return];
        } else {
            return undefined;
        }
    }

    /**
     * Removes fields from result object acctoding to actionData.return array
     * if presented
     * @param {ExpressRequest} req request object
     * @param {object} result result returned by main action processor
     */
    filterResultByReturnRule(req, result) {
        const returnList = this.extractReturn(req.notRouteData);
        if (
            result &&
            typeof result === "object" &&
            returnList &&
            Array.isArray(returnList)
        ) {
            let presented = Object.keys(result);
            presented.forEach((fieldName) => {
                if (!returnList.includes(fieldName)) {
                    delete result[fieldName];
                }
            });
        }
    }

    async executeRoute(modRoute, actionName, { req, res, next }) {
        try {
            //waiting preparation
            let prepared = await this.executeFunction(
                modRoute,
                CONST_BEFORE_ACTION,
                [req, res, next]
            );
            //waiting results
            let result = await this.executeFunction(modRoute, actionName, [
                req,
                res,
                next,
                prepared,
            ]);
            //filter result IF actionData.return specified
            this.filterResultByReturnRule(req, result);
            //run after with results, continue without waiting when it finished
            return this.executeFunction(modRoute, CONST_AFTER_ACTION, [
                req,
                res,
                next,
                result,
            ]);
        } catch (e) {
            next(e);
        }
    }

    async executeFunction(obj, name, params) {
        let result = params.length > 3 ? params[3] : undefined;
        const newResult = await executeObjectFunction(obj, name, params);
        if (typeof newResult !== "undefined") {
            return newResult;
        }
        return result;
    }
}

module.exports = notRoute;

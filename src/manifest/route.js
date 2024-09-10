const CONST_BEFORE_ACTION = "before";
const CONST_AFTER_ACTION = "after";

const { obsoleteRuleFields, obsoleteActionFields } = require("../obsolete");

const notAppIdentity = require("../identity");
const Auth = require("../auth"),
    HttpError = require("../error").Http;

const notManifestRouteResultFilter = require("./result.filter");
const notManifestFilter = require("./manifest.filter");

const {
    copyObj,
    executeObjectFunction,
    firstLetterToUpper,
} = require("../common");

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
     * @param {import('../types').notActionData & import('../types').notRouteRule }   action    action rules object
     * @param {object}   user      user credentials (auth, role, root)
     * @return {object|null}       returns rule or null
     **/
    static actionAvailableByRule(action, user, url = "") {
        if (!action) {
            return null;
        }
        if (
            action.rules &&
            Array.isArray(action.rules) &&
            action.rules.length > 0
        ) {
            return notRoute.cycleThruRules(action.rules, user);
        } else {
            obsoleteActionFields(action, url);
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
            obsoleteRuleFields(rules[i], url);
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
     *	@param	{import('../types').notNodeExpressRequest}	req 	Express Request Object
     *	@return	{import('../types').notRouteRule | null}	rule or null
     */
    selectRule(identity) {
        if (this.actionData) {
            return notRoute.actionAvailableByRule(this.actionData, identity);
        }
        return null;
    }

    /**
     *
     *
     * @param {import('../types').notNodeExpressRequest}       req
     * @param {import('../types').notRouteData} notRouteData
     * @memberof notRoute
     */
    setRequestRouteData(req, notRouteData) {
        req.notRouteData = notRouteData;
    }

    /**
     *
     *
     * @param {string} actionName
     * @param {import('../types').notRouteRule} rule
     * @return {import('../types').notRouteData}
     * @memberof notRoute
     */
    createRequestRouteData(actionName, rule, identity) {
        const actionRule = notManifestFilter.filterRouteAction(
            this.actionData,
            identity.auth,
            identity.role,
            identity.root,
            this.routeName,
            this.moduleName
        );
        return {
            actionName,
            modelName: this.routeName,
            moduleName: this.moduleName,
            modelPath: `${this.moduleName}//${firstLetterToUpper(
                this.routeName
            )}`,
            rule: copyObj(rule),
            actionData: actionRule,
            actionSignature: notManifestFilter.detectActionSignature(
                this.actionData
            ),
        };
    }

    /**
     *	Executes route action if such exist
     *	@param	{import('../types').notNodeExpressRequest}	req 	Express Request Object
     *	@param	{import('express').Response}	res		Express Response Object
     *	@param	{function}	next
     *	@return {object}	result of execution or HttpError
     **/
    exec(req, res, next) {
        try {
            const identity = notAppIdentity.extractAuthData(req);
            const rule = this.selectRule(identity);
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
            obsoleteRuleFields(rule, req.originalUrl);
            const actionName = this.selectActionName(rule);
            const mod = this.notApp.getModule(this.moduleName);
            if (!mod) {
                return next(
                    new HttpError(
                        404,
                        [
                            "module not found",
                            req.method,
                            req.originalUrl,
                            this.moduleName,
                            this.routeName,
                            actionName,
                        ].join("; ")
                    )
                );
            }
            const modRoute = mod.getRoute(this.routeName);
            this.setRequestRouteData(
                req,
                this.createRequestRouteData(actionName, rule, identity)
            );
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
                            req.method,
                            req.originalUrl,
                            this.moduleName,
                            this.routeName,
                            actionName,
                        ].join("; ")
                    )
                );
            }
        } catch (e) {
            this.notApp.report(e);
            next(e);
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

    async executeRoute(modRoute, actionName, { req, res, next }) {
        try {
            let prepared = undefined;
            //waiting preparation
            if (modRoute[CONST_AFTER_ACTION]) {
                prepared = await this.executeFunction(
                    modRoute,
                    CONST_BEFORE_ACTION,
                    [req, res, next]
                );
            }
            //waiting results
            let result = await this.executeFunction(modRoute, actionName, [
                req,
                res,
                next,
                prepared,
            ]);
            //filter result IF actionData.return specified
            if (typeof result !== "undefined" && result) {
                if (typeof result.toObject === "function") {
                    result = result.toObject();
                }
                if (Array.isArray(result)) {
                    result = result.map((itm) =>
                        itm && itm.toObject ? itm.toObject() : itm
                    );
                }
                notManifestRouteResultFilter.filter(
                    req.notRouteData,
                    result,
                    notAppIdentity.extractAuthData(req)
                );
            }
            //run after with results, continue without waiting when it finished
            if (modRoute[CONST_AFTER_ACTION]) {
                return this.executeFunction(modRoute, CONST_AFTER_ACTION, [
                    req,
                    res,
                    next,
                    result,
                ]);
            } else {
                return result;
            }
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

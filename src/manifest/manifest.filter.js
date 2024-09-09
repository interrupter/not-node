const merge = require("deepmerge");
const Auth = require("../auth");
const notFieldsFilter = require("../fields/filter");
const getApp = require("../getApp");
const { firstLetterToUpper } = require("../common");

const DIRTY_FIELDS = [
    "rules",
    "admin",
    "root",
    "safe",
    "auth",
    "role",
    "actionName",
    "actionPrefix",
    "actionSignature",
];

//allow access to safe (for a specific user auth status) fields only
const DEFAULT_FIELDS_SET = ["@safe"];

module.exports = class notManifestFilter {
    static schemaLoader = (name) => getApp().getModelSchema(name);

    /**
     *  Clear route from action variants that not permited for user according to
     *  his auth, role, root status
     *
     *  @param {object}         route           route object
     *  @param {boolean}        auth            user auth status
     *  @param {Array<string>}  role            user role status
     *  @param {boolean}        root            user root status
     *  @param {string}         [moduleName='']      user root status
     *
     *  @return {object}  Return router with only actions user can access with current states of auth, role, root. With removed definitions of what rules of access are.
     **/
    static filterRoute(route, auth, role, root, moduleName = "") {
        let result = JSON.parse(JSON.stringify(route));
        const modelName = result.model;
        result.actions = {};
        if (!route || !route.actions) {
            return result;
        }
        console.log("actions", JSON.stringify(route.actions));
        for (let actionName in route.actions) {
            if (!route.actions[actionName]) {
                continue;
            }
            const resultActionData = notManifestFilter.filterRouteAction(
                route.actions[actionName],
                auth,
                role,
                root,
                modelName,
                moduleName
            );
            if (resultActionData) {
                result.actions[actionName] = resultActionData;
            }
        }
        return result;
    }

    /**
     *
     *
     * @static
     * @param {import('../types').notActionData}    actionSet
     * @param {boolean}                             auth
     * @param {Array<string>}                       role
     * @param {boolean}                             root
     * @param {string}                              [modelName=""]
     * @param {string}                              [moduleName=""]
     */
    static filterRouteAction(
        actionSet,
        auth,
        role,
        root,
        modelName = "",
        moduleName = ""
    ) {
        if (Array.isArray(actionSet.rules)) {
            for (let i = 0; i < actionSet.rules.length; i++) {
                if (
                    Auth.checkCredentials(actionSet.rules[i], auth, role, root)
                ) {
                    return notManifestFilter.clearActionFromRules(
                        actionSet,
                        {
                            auth,
                            role,
                            root,
                            modelName,
                            moduleName,
                            actionSignature:
                                notManifestFilter.detectActionSignature(
                                    actionSet
                                ),
                        },
                        actionSet.rules[i]
                    );
                }
            }
        } else {
            if (Auth.checkCredentials(actionSet, auth, role, root)) {
                return notManifestFilter.clearActionFromRules(
                    actionSet,
                    {
                        auth,
                        role,
                        root,
                        modelName,
                        moduleName,
                        actionSignature:
                            notManifestFilter.detectActionSignature(actionSet),
                    },
                    undefined
                );
            }
        }
        return undefined;
    }

    /**
     *  Filters manifest for current user auth, role, root.
     *  Removes all actions that can not be performed
     *
     *  @param {object}   manifest  full raw manifest
     *  @param {boolean}  auth    user auth status
     *  @param {Array<string>}  role    user role status
     *  @param {boolean}  root    user root status
     *  @param {string}     [moduleName='']
     *
     *  @return {object}  filtered manifest
     **/

    static filter(manifest, auth, role, root, moduleName = "") {
        var result = {};
        for (let routeName in manifest) {
            let routeMan = notManifestFilter.filterRoute(
                manifest[routeName],
                auth,
                role,
                root,
                moduleName
            );
            if (Object.keys(routeMan.actions).length > 0) {
                result[routeName] = routeMan;
            }
        }
        return result;
    }

    /**
     * Return true if ruleSet object has not empty list of fields
     * @param {Object} ruleSet specific set of rules for action
     * @return {boolean} if rule set has not empty fields list
     */
    static ruleSetHasFieldsDirective(ruleSet) {
        return (
            typeof ruleSet !== "undefined" &&
            ruleSet !== null &&
            ruleSet.fields &&
            Array.isArray(ruleSet.fields) &&
            ruleSet.fields.length
        );
    }

    /**
     * Return true if ruleSet object has not empty list of return and return is an Array<string>
     * @param {Object} ruleSet specific set of rules for action
     * @return {boolean} if rule set has not empty fields list
     */
    static ruleSetHasReturnDirectiveInAllStringFormat(ruleSet) {
        return (
            typeof ruleSet !== "undefined" &&
            ruleSet !== null &&
            ruleSet.return &&
            Array.isArray(ruleSet.return) &&
            ruleSet.return.length &&
            ruleSet.return.every(
                (returnFieldName) => typeof returnFieldName === "string"
            )
        );
    }

    static composeFullModelName(moduleName, modelName) {
        if (modelName) {
            if (moduleName) {
                return `${moduleName}//${firstLetterToUpper(modelName)}`;
            } else {
                return `${firstLetterToUpper(modelName)}`;
            }
        }
        return "";
    }

    static loadSchema(fullModelName) {
        if (fullModelName !== "") {
            return this.schemaLoader(fullModelName);
        } else {
            return {};
        }
    }

    /**
     *
     * Returns Action signature for action
     * @static
     * @param {import('../types').notActionData} action
     * @return {string}
     */
    static detectActionSignature(action) {
        if (action) {
            switch (action?.method?.toLocaleLowerCase()) {
                case "get":
                    return Auth.ACTION_SIGNATURES.READ;
                case "post":
                case "patch":
                    return Auth.ACTION_SIGNATURES.UPDATE;
                case "put":
                    return Auth.ACTION_SIGNATURES.CREATE;
                case "delete":
                    return Auth.ACTION_SIGNATURES.DELETE;

                default:
                    return Auth.ACTION_SIGNATURES.READ;
            }
        }
        return Auth.ACTION_SIGNATURES.READ;
    }

    static filterReturnSet(
        returnSet,
        modelSchema,
        {
            auth = false,
            role = [Auth.DEFAULT_USER_ROLE_FOR_GUEST],
            root = false,
            modelName = "",
            actionSignature = undefined,
        } = {
            auth: false,
            role: [Auth.DEFAULT_USER_ROLE_FOR_GUEST],
            root: false,
            modelName: "",
            actionSignature: undefined,
        }
    ) {
        if (
            notManifestFilter.ruleSetHasReturnDirectiveInAllStringFormat({
                return: returnSet,
            })
        ) {
            return notFieldsFilter.filter([...returnSet], modelSchema, {
                action: actionSignature,
                roles: role,
                auth,
                root,
                modelName,
            });
        }
        return returnSet;
    }

    static filterFieldsPropOfActionRule(
        actionRule,
        { modelSchema, modelName, ruleSet, actionSignature, role, auth, root }
    ) {
        const fields = notManifestFilter.ruleSetHasFieldsDirective(ruleSet)
            ? [...ruleSet.fields]
            : DEFAULT_FIELDS_SET;

        actionRule.fields = notFieldsFilter.filter(fields, modelSchema, {
            action: actionSignature,
            roles: role,
            auth,
            root,
            modelName,
        });

        //remove fields property if list is empty
        if (actionRule.fields.length == 0) {
            delete actionRule.fields;
        }
    }

    static filterReturnPropOfActionRule(
        actionRule,
        { modelSchema, modelName, ruleSet, actionSignature, role, auth, root }
    ) {
        if (ruleSet && ruleSet.return) {
            actionRule.return = notManifestFilter.filterReturnSet(
                ruleSet.return,
                modelSchema,
                {
                    auth,
                    role,
                    root,
                    modelName,
                    actionSignature,
                }
            );
        }
    }

    /**
     *  Clear action definition from rules of access
     *  @param      {object}                action   action data
     *  @param      {object}                mods specific set of rules for this action
     *  @param      {boolean}               mods.auth
     *  @param      {boolean}               mods.root
     *  @param      {Array<string>}         mods.role
     *  @param      {string}                mods.modelName
     *  @param      {string}                mods.moduleName
     *  @param      {string|undefined}      mods.actionSignature    create/read/update/delete
     *  @param      {object}                [ruleSet] specific set of rules for this action
     *  @return     {object}               clean action data
     **/
    static clearActionFromRules(
        action,
        {
            auth = false,
            role = [Auth.DEFAULT_USER_ROLE_FOR_GUEST],
            root = false,
            modelName = "",
            moduleName = "",
            actionSignature = undefined,
        } = {
            auth: false,
            role: [Auth.DEFAULT_USER_ROLE_FOR_GUEST],
            root: false,
            modelName: "",
            moduleName: "",
            actionSignature: undefined,
        },
        ruleSet = null
    ) {
        //full copy
        let actionRule = merge({}, action);
        //removes server side or secret information (full list of access rules)
        notManifestFilter.clearFromDirtyFields(actionRule);
        //retrives model schema
        const fullModelName = this.composeFullModelName(moduleName, modelName);
        const modelSchema = this.loadSchema(fullModelName);
        //copy fields list from rule to action if it exists
        //fields list is used to restrict fields of data that could be accessed via
        //this action
        this.filterFieldsPropOfActionRule(actionRule, {
            modelName,
            modelSchema,
            ruleSet,
            actionSignature,
            role,
            auth,
            root,
        });
        //
        this.filterReturnPropOfActionRule(actionRule, {
            modelName,
            modelSchema,
            ruleSet,
            actionSignature,
            role,
            auth,
            root,
        });
        return actionRule;
    }

    /**
     * Deletes fields listed in DIRTY_FIELDS constant from object
     * @param {Object} action action object
     **/
    static clearFromDirtyFields(action) {
        DIRTY_FIELDS.forEach((fieldName) => {
            delete action[fieldName];
        });
    }
};

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
        for (let actionName in route.actions) {
            if (!route.actions[actionName]) {
                continue;
            }
            let actionSet = route.actions[actionName];
            notManifestFilter.filterRouteAction(
                actionName,
                actionSet,
                auth,
                role,
                root,
                result,
                modelName,
                moduleName
            );
        }
        return result;
    }

    /**
     *
     *
     * @static
     * @param {string}                              actionName
     * @param {import('../types').notActionData}    actionSet
     * @param {boolean}                             auth
     * @param {Array<string>}                       role
     * @param {boolean}                             root
     * @param {any}                                 result
     * @param {string}                              [modelName=""]
     * @param {string}                              [moduleName=""]
     */
    static filterRouteAction(
        actionName,
        actionSet,
        auth,
        role,
        root,
        result,
        modelName = "",
        moduleName = ""
    ) {
        if (Array.isArray(actionSet.rules)) {
            for (let i = 0; i < actionSet.rules.length; i++) {
                if (
                    Auth.checkCredentials(actionSet.rules[i], auth, role, root)
                ) {
                    result.actions[actionName] =
                        notManifestFilter.clearActionFromRules(
                            actionSet,
                            actionSet.rules[i],
                            {
                                auth,
                                role,
                                root,
                                modelName,
                                moduleName,
                                actionSignature: actionSet.actionSignature,
                            }
                        );
                    break;
                }
            }
        } else {
            if (Auth.checkCredentials(actionSet, auth, role, root)) {
                result.actions[actionName] =
                    notManifestFilter.clearActionFromRules(
                        actionSet,
                        undefined,
                        {
                            auth,
                            role,
                            root,
                            modelName,
                            moduleName,
                            actionSignature: actionSet.actionSignature,
                        }
                    );
            }
        }
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
     *  Clear action definition from rules of access
     *  @param      {object}                action   action data
     *  @param      {object}                [ruleSet] specific set of rules for this action
     *  @param      {object}                mods specific set of rules for this action
     *  @param      {boolean}               mods.auth
     *  @param      {boolean}               mods.root
     *  @param      {Array<string>}         mods.role
     *  @param      {string}                mods.modelName
     *  @param      {string}                mods.moduleName
     *  @param      {string|undefined}                mods.actionSignature    create/read/update/delete
     *  @return     {object}               clean action data
     **/
    static clearActionFromRules(
        action,
        ruleSet = null,
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
        }
    ) {
        let copy = merge({}, action);
        notManifestFilter.clearFromDirtyFields(copy);
        //copy fields list from rule to action if it exists
        //fields list is used to restrict fields of data that could be accessed via
        //this action
        if (notManifestFilter.ruleSetHasFieldsDirective(ruleSet)) {
            const fullModelName = this.composeFullModelName(
                moduleName,
                modelName
            );
            copy.fields = notFieldsFilter.filter(
                [...ruleSet.fields],
                this.loadSchema(fullModelName),
                { action: actionSignature, roles: role, auth, root, modelName }
            );
        }
        return copy;
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

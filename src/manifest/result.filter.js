const notPath = require("not-path");
const { objHas, copyObj } = require("../common");
const notManifestFilter = require("./manifest.filter");

const Auth = require("../auth/const");

const PROP_NAME_RETURN_ROOT = "returnRoot"; //path to object to filter
const PROP_NAME_RETURN_RULE = "return"; //filtering rule
const PROP_NAME_RETURN_STRICT = "returnStrict"; //if filtering should be strict

/**
 * @const {boolean} DEFAULT_STRICT_MODE
 * active only in complex rules presented as objects
 * defines if filtering should exclude any not mentioned property and sub property in map object
 * Example:
 * target structure =
 *  {
 *      id,
 *      user:{
 *          id,
 *          username,
 *          aliases: [
 *              {id, title, createdAt},
 *              {id, title, createdAt, banned}
 *          ],
 *          createdAt
 *      },
 *      clean
 *  }
 * rule object =
 *  {
 *      id,
 *      'user.aliases': ['id', 'title', 'banned']
 *  }
 * in strict==true
 * filtered target structure =
 *  {
 *      id,
 *      user:{
 *          aliases: [
 *              {id, title},
 *              {id, title, banned}
 *          ]
 *      }
 *  }
 * in strict==false
 * filtered target structure = {
 *      id,
 *      user:{
 *          id,
 *          username,
 *          aliases: [
 *              {id, title},
 *              {id, title, banned}
 *          ],
 *          createdAt
 *      }
 *  }
 */
const DEFAULT_STRICT_MODE = false;

module.exports = class notManifestRouteResultFilter {
    /**
     * Removes fields from result object acctoding to actionData.return array
     * if presented
     * @param {object} notRouteData request rules and preferencies
     * @param {object} result result returned by main action processor
     * @param {import('../types').notAppIdentityShortData} identity
     */
    static filter(
        notRouteData,
        result,
        identity = {
            auth: false,
            admin: false,
            root: false,
            primaryRole: Auth.DEFAULT_USER_ROLE_FOR_GUEST,
            role: [Auth.DEFAULT_USER_ROLE_FOR_GUEST],
        }
    ) {
        if (!(result && typeof result === "object")) return;
        let filteringRule = this.getFilteringRule(notRouteData);
        if (!filteringRule) return;
        const filteringTarget = this.getFilteringTarget(result, notRouteData);
        if (!filteringTarget) {
            return;
        }
        filteringRule = notManifestFilter.filterReturnSet(
            filteringRule,
            notManifestFilter.loadSchema(notRouteData.modelPath),
            {
                auth: identity.auth,
                role: identity.role,
                root: identity.root,
                modelName: notRouteData.modelName,
                moduleName: notRouteData.moduleName,
                actionSignature: notRouteData.actionSignature,
            }
        );
        if (Array.isArray(filteringTarget)) {
            filteringTarget.forEach((filteringTargetItem) => {
                this.filterByRule(
                    filteringTargetItem,
                    filteringRule,
                    this.getFilteringStrictMode(notRouteData)
                );
            });
        } else {
            this.filterByRule(
                filteringTarget,
                filteringRule,
                this.getFilteringStrictMode(notRouteData)
            );
        }

        return result;
    }

    /**
     * modifies target according to rule
     * @param {object}  target      object which properties should be filtered
     * @param {array}   rule        filtering rule
     * @param {boolean} strict      filtering mode
     */

    static filterByRule(target, rule, strict = DEFAULT_STRICT_MODE) {
        if (!rule || !target) {
            return;
        }
        if (Array.isArray(rule)) {
            this.filterByArrayRule(target, rule); //flat map always strict==true
        } else if (typeof rule === "object") {
            this.filterByMapRule(target, rule, strict); //object map strict could vary
        }
    }

    /**
     * filters target by rule.
     * Rule form: {pathToProperty: filteringRuleArray, pathToProperty: filteringRuleMap }
     * pathToProperty should be in notPath notation except starting symbol (default: ':')
     * if pathToProperty targets array in target, each item of array will be filtered by
     * @param {object} target
     * @param {object} rule         map of properties.
     * @param {boolean} [strict = DEFAULT_STRICT_MODE]      filtering mode
     * example:
     * {
     *      'user': ['username', 'id', 'email'], //filtering properties of object target.user
     *      'posts': ['id', 'title'],            //filtering properties of array of objects target.posts
     *      'friends.list': ['id', 'username']   //filtering props of array of objects target.friends.list by path.
     *                                           //if strict==false: will not drop any from friends.*, only friends.list cotent will be processed
     *                                           //if strict==true: will drop all properties of friends except list
     *      'friends': {                         //this will clear friends sub-object from any properties except 'list' in any strict mode
     *          'list': ['id', 'username']       //and filter 'list' items
     *      },
     *      'storage': {                         //filtering complex sub object by map
     *          'files':{
     *              'cloud': ['id','title'],
     *              'local': ['id', 'title', 'size']
     *          }
     *      }
     * }
     */
    static filterByMapRule(target, rule, strict = DEFAULT_STRICT_MODE) {
        //to form ['id', 'user.username', 'files']
        const filteringArray = Object.keys(rule);
        //filtering direct children if in strict mode
        if (strict) {
            this.filterStrict(target, filteringArray);
        }
        //filter properties
        for (let filteringTargetName of filteringArray) {
            const subTarget = notPath.get(
                `${notPath.PATH_START_OBJECT}${filteringTargetName}`,
                target,
                {}
            );
            //if sub target Array filtering each item individualy
            if (Array.isArray(subTarget)) {
                subTarget.forEach((subTargetItem) => {
                    this.filterByRule(
                        subTargetItem,
                        rule[filteringTargetName],
                        strict
                    );
                });
            } else if (typeof subTarget == "object") {
                this.filterByRule(subTarget, rule[filteringTargetName], strict);
            }
        }
    }

    static filterStrict(target, filteringArray) {
        console.log(target, filteringArray);
        //to form ['id', 'user', 'files']
        const filteringArrayDirectChildren = filteringArray.map(
            (propName) => propName.split(notPath.PATH_SPLIT)[0]
        );
        //filter strict direct children
        this.filterByArrayRule(target, filteringArrayDirectChildren);
        //filter strict each level in props paths in filteringArray
        for (let path of filteringArray) {
            let pathParts = path.split(notPath.PATH_SPLIT);
            if (pathParts.length === 1) {
                continue;
            }
            //property name in which we will clean content except pathParts[1]
            const directPropName = pathParts.shift();
            //
            const subTarget = target[directPropName];
            if (Array.isArray(subTarget)) continue;
            const subFilteringArray = [pathParts.join(notPath.PATH_SPLIT)];
            this.filterStrict(subTarget, subFilteringArray);
        }
    }

    /**
     * filters target properties by rule, all properties which names are not presented in rule
     * array will be removed from target
     * @param {object} target object to filter
     * @param {Array} rule list of enabled properties. example: ['id', 'title', 'createdAt']
     */
    static filterByArrayRule(target, rule) {
        const presented = Object.keys(target);
        presented.forEach((fieldName) => {
            if (!rule.includes(fieldName)) {
                delete target[fieldName];
            }
        });
    }

    /**
     * returns filtering rule object or undefined
     * @param {object} notRouteData
     * @returns {object|Array|undefined}  rule to filter result object properties
     */
    static getFilteringRule(notRouteData) {
        if (objHas(notRouteData.rule, PROP_NAME_RETURN_RULE)) {
            return copyObj(notRouteData.rule[PROP_NAME_RETURN_RULE]);
        } else if (objHas(notRouteData.actionData, PROP_NAME_RETURN_RULE)) {
            return copyObj(notRouteData.actionData[PROP_NAME_RETURN_RULE]);
        } else {
            return undefined;
        }
    }

    /**
     * Returns path to sub object which properties should be filtered
     * @param {object} notRouteData
     * @returns {string}  path of sub object in notPath notation
     */
    static getFilteringTargetPath(notRouteData) {
        let path = `${notPath.PATH_START_OBJECT}`;
        if (notRouteData) {
            if (objHas(notRouteData.rule, PROP_NAME_RETURN_ROOT)) {
                path += notRouteData.rule[PROP_NAME_RETURN_ROOT];
            } else if (objHas(notRouteData.actionData, PROP_NAME_RETURN_ROOT)) {
                path += notRouteData.actionData[PROP_NAME_RETURN_ROOT];
            }
        }
        return path;
    }

    /**
     * Returns object which properties should be filtered
     * @param {object}  result  request result
     * @param {object}  notRouteData  request route rules and prefs
     * @returns {object} object to filter
     */
    static getFilteringTarget(result, notRouteData) {
        if (result && typeof result == "object") {
            const returnListRoot = this.getFilteringTargetPath(notRouteData);
            return notPath.get(returnListRoot, result, {});
        } else {
            return result;
        }
    }

    static getFilteringStrictMode(notRouteData) {
        if (notRouteData) {
            if (objHas(notRouteData.rule, PROP_NAME_RETURN_STRICT)) {
                return !!notRouteData.rule[PROP_NAME_RETURN_STRICT];
            } else if (
                objHas(notRouteData.actionData, PROP_NAME_RETURN_STRICT)
            ) {
                return !!notRouteData.actionData[PROP_NAME_RETURN_STRICT];
            }
        }
        return this.DEFAULT_STRICT_MODE;
    }

    static get PROP_NAME_RETURN_ROOT() {
        return PROP_NAME_RETURN_ROOT;
    }

    static get PROP_NAME_RETURN_RULE() {
        return PROP_NAME_RETURN_RULE;
    }

    static get PROP_NAME_RETURN_STRICT() {
        return PROP_NAME_RETURN_STRICT;
    }

    static get DEFAULT_STRICT_MODE() {
        return DEFAULT_STRICT_MODE;
    }
};

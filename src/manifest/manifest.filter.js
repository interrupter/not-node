const merge = require('deepmerge');
const Auth = require('../auth');

const DIRTY_FIELDS = ['rules', 'admin', 'root', 'safe', 'auth', 'role', 'actionName', 'actionPrefix'];

module.exports = class notManifestFilter {
  /**
   *  Clear route from action variants that not permited for user according to
   *  his auth, role, root status
   *
   *  @param {object}   route  route object
   *  @param {boolean}  auth  user auth status
   *  @param {boolean}  role  user role status
   *  @param {boolean}  root  user root status
   *
   *  @return {object}  Return router with only actions user can access with current states of auth, role, root. With removed definitions of what rules of access are.
   **/
  static filterRoute(route, auth, role, root) {
    let result = JSON.parse(JSON.stringify(route));
    result.actions = {};
    if (!route || !route.actions) {
      return result;
    }
    for (let actionName in route.actions) {
      if (!route.actions[actionName]) {
        continue;
      }
      let actionSet = route.actions[actionName];
      notManifestFilter.filterRouteAction(actionName, actionSet, auth, role, root, result);
    }
    return result;
  }

  /**
  *
  */
  static filterRouteAction(actionName, actionSet, auth, role, root, result) {
    if (Array.isArray(actionSet.rules)) {
      for (let i = 0; i < actionSet.rules.length; i++) {
        if (Auth.checkCredentials(actionSet.rules[i], auth, role, root)) {
          result.actions[actionName] = notManifestFilter.clearActionFromRules(actionSet, actionSet.rules[i]);
          break;
        }
      }
    } else {
      if (Auth.checkCredentials(actionSet, auth, role, root)) {
        result.actions[actionName] = notManifestFilter.clearActionFromRules(actionSet);
      }
    }
  }

  /**
   *  Filters manifest for current user auth, role, root.
   *  Removes all actions that can not be performed
   *
   *  @param {object}   manifest  full raw manifest
   *  @param {boolean}  auth    user auth status
   *  @param {boolean}  role    user role status
   *  @param {boolean}  root    user root status
   *
   *  @return {object}  filtered manifest
   **/

  static filter(manifest, auth, role, root) {
    var result = {};
    for (let routeName in manifest) {
      let routeMan = notManifestFilter.filterRoute(manifest[routeName], auth, role, root);
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
    return (typeof ruleSet !== 'undefined' && ruleSet !== null) && (ruleSet.fields && Array.isArray(ruleSet.fields) && ruleSet.fields.length);
  }

  /**
   *  Clear action definition from rules of access
   *  @param  {object}  action   action data
   *  @param  {object}  ruleSet specific set of rules for this action
   *  @return  {object}  clean action data
   **/
  static clearActionFromRules(action, ruleSet = null) {
    let copy = merge({}, action);
    notManifestFilter.clearFromDirtyFields(copy);
    //copy fields list from rule to action if it exists
    //fields list is used to restrict fields of data that could be accessed via
    //this action
    if (notManifestFilter.ruleSetHasFieldsDirective(ruleSet)) {
      copy.fields = [...ruleSet.fields];
    }
    return copy;
  }


  /**
  * Deletes fields listed in DIRTY_FIELDS constant from object
  * @param {Object} action action object
  **/
  static clearFromDirtyFields(action) {
    DIRTY_FIELDS.forEach(fieldName => {
      delete action[fieldName];
    });
  }
};

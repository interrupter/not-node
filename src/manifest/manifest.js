const Auth = require('../auth');
const Parser = require('../parser');
const Route = require('./route');
const merge = require('deepmerge');

const DIRTY_FIELDS = ['rules', 'admin', 'root', 'safe', 'auth', 'role', 'actionName', 'actionPrefix'];

/**
 *  API manifest
 *  @class
 *  @param  {object}   app      express application instance
 *  @param  {object}  notApp    notApplication instance
 *  @param  {string}  moduleName  name of owner module
 **/
class notManifest {
  constructor(app, notApp, moduleName) {
    this.app = app;
    this.notApp = notApp;
    this.moduleName = moduleName;
    return this;
  }

  /**
   *  Создаем путь для одной конечной точки
   *
   *  @param  {object}  app        express app object
   *  @param  {string}  routesPath    directory where routes files is placed
   *  @param  {string}  routeLine    aka '/login', '/user/:id', etc
   *  @param  {string}  modelName    name of the mongoose model, should be exact as file name with routes for this model. If /models/theme.js contains 'Theme' mongoose model, then /routes/theme.js should  `
   *  contain routes for that model.
   *  @param  {string}  actionSetName  name of action in routes file. Look for existing route file for understanding
   *  @param  {object}  actionData    representation of action data
   *
   *  @return  {boolean}  if route were registered
   */

  registerRouteForAction(routeLine, routeName, actionName, actionData) {
    if (actionData && actionData.method) {
      const routerAction = new Route(this.notApp, this.moduleName, routeName, actionName, actionData);
      this.app[actionData.method.toLowerCase()](routeLine, routerAction.exec.bind(routerAction));
      return true;
    } else {
      return false;
    }
  }

  /**
   *  Создаем пути согласно манифесту
   *
   *  @param  {object}  moduleManifest  notManifest of module
   */

  registerRoutes(moduleManifest) {
    let actionData,
      routeLine;
    for (let route of Object.keys(moduleManifest)) {
      if (Object.prototype.hasOwnProperty.call(moduleManifest[route], 'actions') && Object.prototype.hasOwnProperty.call(moduleManifest[route], 'url')) {
        for (let action of Object.keys(moduleManifest[route].actions)) {
          actionData = moduleManifest[route].actions[action];
          routeLine = Parser.getRouteLine(moduleManifest[route].url, route, action, actionData);
          this.registerRouteForAction(routeLine, route, action, actionData);
        }
      }
    }
  }

  /**
   * Deletes fields listed in DIRTY_FIELDS constant from object
   * @param {Object} action action object
   */
  clearFromDirtyFields(action) {
    DIRTY_FIELDS.forEach(fieldName => {
      delete action[fieldName];
    });
  }

  /**
   * Return true if ruleSet object has not empty list of fields
   * @param {Object} ruleSet specific set of rules for action
   * @return {boolean} if rule set has not empty fields list
   */
  ruleSetHasFieldsDirective(ruleSet) {
    return (typeof ruleSet !== 'undefined' && ruleSet !== null) && (ruleSet.fields && Array.isArray(ruleSet.fields) && ruleSet.fields.length);
  }

  /**
   *  Clear action definition from rules of access
   *  @param  {object}  action   action data
   *  @param  {object}  ruleSet specific set of rules for this action
   *  @return  {object}  clean action data
   **/
  clearActionFromRules(action, ruleSet = null) {
    let copy = merge({}, action);
    this.clearFromDirtyFields(copy);
    //copy fields list from rule to action if it exists
    //fields list is used to restrict fields of data that could be accessed via
    //this action
    if (this.ruleSetHasFieldsDirective(ruleSet)) {
      copy.fields = [...ruleSet.fields];
    }
    return copy;
  }

  /**
   *  Clear route from action variants that not permited for user according to
   *  his auth, role, root status
   *
   *  @param {object}    route  route object
   *  @param {boolean}  auth  user auth status
   *  @param {boolean}  role  user role status
   *  @param {boolean}  root  user root status
   *
   *  @return {object}  Return router with only actions user can access with current states of auth, role, root. With removed definitions of what rules of access are.
   **/

  filterManifestRoute(route, auth, role, root) {
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
      this.filterManifestRouteAction(actionName, actionSet, auth, role, root, result);
    }
    return result;
  }

  /**
  *
  */
  filterManifestRouteAction(actionName, actionSet, auth, role, root, result) {
    if (Array.isArray(actionSet.rules)) {
      for (let i = 0; i < actionSet.rules.length; i++) {
        if (Auth.checkCredentials(actionSet.rules[i], auth, role, root)) {
          result.actions[actionName] = this.clearActionFromRules(actionSet, actionSet.rules[i]);
          break;
        }
      }
    } else {
      if (Auth.checkCredentials(actionSet, auth, role, root)) {
        result.actions[actionName] = this.clearActionFromRules(actionSet);
      }
    }
  }
  /*
  getActionManifest(action, auth, role, root){

  }
  */
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

  filterManifest(manifest, auth, role, root) {
    var result = {};
    for (let routeName in manifest) {
      let routeMan = this.filterManifestRoute(manifest[routeName], auth, role, root);
      if (Object.keys(routeMan.actions).length > 0) {
        result[routeName] = routeMan;
      }
    }
    return result;
  }

}

module.exports = notManifest;

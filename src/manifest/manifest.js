const Parser = require("../parser");
const Route = require("./route");

const { objHas } = require("../common");

const notManifestFilter = require("./manifest.filter.js");

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
     **/

    registerRouteForAction(routeLine, routeName, actionName, actionData) {
        if (actionData && actionData.method) {
            const routerAction = new Route(
                this.notApp,
                this.moduleName,
                routeName,
                actionName,
                actionData
            );
            this.app[actionData.method.toLowerCase()](
                routeLine,
                routerAction.exec.bind(routerAction)
            );
            return true;
        } else {
            return false;
        }
    }

    /**
     *  Создаем пути согласно манифесту
     *
     *  @param  {object}  moduleManifest  notManifest of module
     **/
    registerRoutes(moduleManifest) {
        Object.values(moduleManifest).forEach((route) =>
            this.registerRoute(route)
        );
    }

    /**
     * Check if manifest file has url, model and actions, so we could register routes
     * @param  {object}  route   content of .manifest.js file
     * @return {boolean}         true if could create routes
     **/
    routeHasRoutes(route) {
        return (
            objHas(route, "actions") &&
            objHas(route, "url") &&
            objHas(route, "model") &&
            route.model !== ""
        );
    }

    /**
     * Check if manifest file has url and actions, so we could register routes
     * @param  {object}  moduleManifest    library of .manifest.js files
     * @param  {string}  routeName         name of
     **/
    registerRoute(route) {
        if (!this.routeHasRoutes(route)) {
            return;
        }
        const routeName = route.model;
        Object.keys(route.actions).forEach((actionName) => {
            const actionData = route.actions[actionName];
            const routeLine = Parser.getRouteLine(
                route.url,
                routeName,
                actionName,
                actionData
            );
            this.registerRouteForAction(
                routeLine,
                routeName,
                actionName,
                actionData
            );
        });
    }

    /**
     *  Filters manifest for current user auth, role, root.
     *  Removes all actions that can not be performed
     *
     *  @param {object}   manifest  full raw manifest
     *  @param {boolean}  auth    user auth status
     *  @param {Array<string>}  role    user role status
     *  @param {boolean}  root    user root status
     *
     *  @return {object}  filtered manifest
     **/

    filterManifest(manifest, auth, role, root) {
        return notManifestFilter.filter(
            manifest,
            auth,
            role,
            root,
            this.moduleName
        );
    }
}

module.exports = notManifest;

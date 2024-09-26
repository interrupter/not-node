const fs = require("fs");
const path = require("path");
const logger = require("not-log");
const log = logger(module, "registrator");

const { tryFile, mapBind } = require("../../common");

const notModuleRegistratorRoutesWS = require("./routes.ws");

/**
 * Manifest files ending
 * @constant
 * @type {Array<string>}
 */
const DEFAULT_MANIFEST_FILE_ENDINGS = [".manifest.js", ".manifest.cjs"];

/**
 * Routes collection files ending
 * @constant
 * @type {Array<string>}
 */
const DEFAULT_ROUTES_FILE_ENDINGS = [".js", ".cjs"];

/**
 * WS End-points collection files ending
 * @constant
 * @type {Array<string>}
 */
const DEFAULT_WS_ROUTES_FILE_ENDINGS = [".ws.js", ".ws.cjs"];

/**
 * List of methods to be binded from notApp to routes and WS end-points
 * @constant
 * @type {Array<string>}
 */
const ROUTE_BINDINGS_LIST = [
    "getLogic",
    "getLogicFile",
    "getModel",
    "getModelFile",
    "getModelSchema",
    "getModule",
];

module.exports = class notModuleRegistratorRoutes {
    static openFile = require;

    static run({ nModule }) {
        const srcDir = notModuleRegistratorRoutes.getPath(nModule);
        if (!srcDir) {
            return false;
        }
        this.findAll({
            nModule,
            srcDir,
        });
        return true;
    }

    static getPath(nModule) {
        return nModule.module.paths.routes;
    }

    /**
     * Searching fields in directory
     * @static
     * @param {Object}                  input
     * @param {import('../module')}     input.nModule
     * @param {string}                  input.srcDir
     **/
    static findAll({ nModule, srcDir }) {
        fs.readdirSync(srcDir).forEach((file) =>
            this.findOne({ nModule, file, srcDir })
        );
    }

    static getFileBasename(file, possible_extensions = []) {
        for (let ext of possible_extensions) {
            if (file.indexOf(ext) !== -1) {
                return file.substr(0, file.indexOf(ext));
            }
        }
        return false;
    }

    static findOne({ nModule, srcDir, file }) {
        try {
            //если имя похоже на название манифеста
            const routeBasename = this.getFileBasename(
                file,
                DEFAULT_MANIFEST_FILE_ENDINGS
            );
            if (!routeBasename) {
                return false;
            }
            const routeManifest =
                notModuleRegistratorRoutes.tryRouteManifestFile({
                    srcDir,
                    file,
                });
            //без манифеста ничего выставить наружу не выйдет
            if (!routeManifest) {
                return false;
            }
            //ищем end-points
            const route = notModuleRegistratorRoutes.tryRouteFile({
                srcDir,
                routeBasename,
            });
            const wsRoute = notModuleRegistratorRoutes.tryWSRouteFile({
                srcDir,
                routeBasename,
            });
            if (!route && !wsRoute) {
                return false;
            }
            this.registerManifestAndRoutes({
                nModule,
                routeManifest,
                routeName: route ? route.thisRouteName : routeBasename,
                route,
                wsRoute,
            });
            return true;
        } catch (e) {
            log && log.error(e);
            return false;
        }
    }

    static tryRouteFile({ srcDir, routeBasename }) {
        for (let ext of DEFAULT_ROUTES_FILE_ENDINGS) {
            const routePath = path.join(srcDir, routeBasename + ext);
            if (tryFile(routePath)) {
                const route = notModuleRegistratorRoutes.openFile(routePath);
                route.filename = routePath;
                if (!route.thisRouteName) {
                    route.thisRouteName = routeBasename;
                }
                return route;
            }
        }
        return false;
    }

    static tryRouteManifestFile({ srcDir, file }) {
        const routeManifestPath = path.join(srcDir, file);
        if (tryFile(routeManifestPath)) {
            return notModuleRegistratorRoutes.openFile(routeManifestPath);
        } else {
            return false;
        }
    }

    static tryWSRouteFile({ srcDir, routeBasename }) {
        for (let ext of DEFAULT_WS_ROUTES_FILE_ENDINGS) {
            const routeWSPath = path.join(srcDir, routeBasename + ext);
            if (tryFile(routeWSPath)) {
                const wsRoute =
                    notModuleRegistratorRoutes.openFile(routeWSPath);
                if (!wsRoute.thisRouteName) {
                    wsRoute.thisRouteName = routeBasename;
                }
                return wsRoute;
            }
        }
        return false;
    }

    static registerManifestAndRoutes({
        nModule,
        routeName,
        routeManifest,
        route,
        wsRoute,
    }) {
        notModuleRegistratorRoutes.registerManifest({
            nModule,
            routeManifest,
            routeName,
        });
        if (route) {
            this.registerRoute({
                nModule,
                route,
                routeName: route.thisRouteName,
            });
        }
        if (wsRoute) {
            this.registerWSRoute({ nModule, wsRoute });
        }
    }

    static registerRoute({ nModule, route, routeName }) {
        nModule.setRoute(route.thisRouteName, route);
        if (nModule.appIsSet()) {
            mapBind(nModule.getApp(), route, ROUTE_BINDINGS_LIST);
        }
        route.log = logger(route, `Route#${routeName}`);
        route.getThisModule = () => nModule;
    }

    static registerWSRoute({ nModule, wsRoute }) {
        notModuleRegistratorRoutesWS.run({
            nModule,
            wsRoute: wsRoute,
            wsRouteName: wsRoute.thisRouteName,
        });
    }

    static registerManifest({ nModule, routeManifest, routeName }) {
        nModule.setManifest(routeName, routeManifest);
    }
};

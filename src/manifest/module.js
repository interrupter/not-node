//importing modules
const fs = require("fs"),
    Auth = require("../auth"),
    logger = require("not-log"),
    log = logger(module, "notModule"),
    notManifest = require("./manifest.js"),
    notModuleRegistrator = require("./registrator"),
    notModuleInitializator = require("./initializator"),
    { objHas, mapBind, executeObjectFunction } = require("../common");

const {RESOURCES_PATH_SPLITTER} = require('./const.js');

/**
 * Standart splitter of module resources paths
 * @constant
 * @type {string}
 */
const DEFAULT_WS_ROUTE_ACTION_SPLITTER = "//";

/**
 * List of methods to be binded from notApp to notModule
 * @constant
 * @type {Array<string>}
 */
const MODULE_BINDINGS_LIST = ["getModel", "getModelSchema", "getModelFile"];
/**
 *	Module representation
 *	@class
 *	@param	{Object} 	options			options
 *	@param	{String} 	options.modPath			path to module location
 *	@param	{Object} 	options.modObject		loaded module object
 **/
class notModule {
    constructor(options) {
        this.path = options.modPath;
        this.module = options.modObject;
        this.mongoose = options.mongoose;
        this.notApp = options.notApp;
        this.routes = {};
        this.routesWS = {
            servers: {},
            clients: {},
        };
        this.models = {};
        this.logics = {};
        this.forms = {};
        this.formsConstructors = {};
        this.fields = {};
        this.manifests = {};
        this.faulty = false;
        this.paths = {
            routes: {},
            models: {},
        };
        this.fieldsImportRules =
            objHas(options, "fields") && options.fields ? options.fields : {};

        //  log.info(`Creating module: ${this.getName()}`);
        this.init();
        return this;
    }

    init() {
        if (this.path) {
            this.initFromPath(this.path);
        } else if (this.module) {
            this.initFromModule();
        } else {
            return false;
        }
        if (this.module === null || typeof this.module === "undefined") {
            log && log.error(`Module ${this.path} not loaded`);
        } else if (this.appIsSet()) {
            mapBind(this.notApp, this.module, MODULE_BINDINGS_LIST);
        }
    }

    initFromPath(modulePath) {
        try {
            if (fs.lstatSync(modulePath).isDirectory()) {
                this.module = require(modulePath);
                this.registerContent();
            } else {
                return false;
            }
        } catch (e) {
            this.faulty = true;
            log && log.error(e);
        }
    }

    initFromModule() {
        try {
            this.registerContent();
        } catch (e) {
            this.faulty = true;
            log && log.error(e);
        }
    }

    registerContent() {
        notModuleRegistrator.exec({ nModule: this });
    }

    getEndPoints() {
        return this.routesWS;
    }

    getManifest(
        { auth, role, root } = {
            auth: false,
            role: [Auth.DEFAULT_USER_ROLE_FOR_GUEST],
            root: false,
        }
    ) {
        return (
            this.manifest &&
            this.manifest.filterManifest(this.manifests, auth, role, root)
        );
    }

    getRouteManifest(name) {
        return this.manifests[name];
    }

    getRoutesManifests() {
        return this.manifests;
    }

    getModelFile(modelName) {
        if (this.models && objHas(this.models, modelName)) {
            return this.models[modelName];
        } else {
            return null;
        }
    }

    getModel(modelName) {
        let modelFile = this.getModelFile(modelName);
        if (modelFile && modelName in modelFile) {
            return modelFile[modelName];
        } else {
            return null;
        }
    }

    getModels() {
        return this.models;
    }

    getModelsNames(full = false){
        const list = Object.keys(this.models);
        if(full){
            const moduleName = this.getName();
            return list.map(name=> `${moduleName}${RESOURCES_PATH_SPLITTER}${name}`);
        }else{
            return list;
        }
    }

    getLogicFile(logicName) {
        if (this.logics && objHas(this.logics, logicName)) {
            return this.logics[logicName];
        } else {
            return null;
        }
    }

    getLogic(logicName) {
        let logicFile = this.getLogicFile(logicName);
        if (logicFile && logicName in logicFile) {
            return logicFile[logicName];
        } else {
            return null;
        }
    }

    getModelSchema(modelName) {
        let modelFile = this.getModelFile(modelName);
        if (modelFile && objHas(modelFile, modelName) && modelFile.thisSchema) {
            return modelFile.thisSchema;
        }
        return null;
    }

    getModelFields(modelName) {
        const modelFile = this.getModelFile(modelName);
        if (modelFile && objHas(modelFile, 'FIELDS') && modelFile.FIELDS) {
            return modelFile.FIELDS;
        }
        return null;
    }

    expose(expressApp, moduleName) {
        if (this.manifests && expressApp) {
            notModuleInitializator.exec({ nModule: this });
            this.initManifest(expressApp, moduleName);
            this.manifest && this.manifest.registerRoutes(this.manifests);
        }
    }

    initManifest(expressApp, moduleName) {
        this.manifest = new notManifest(expressApp, this.notApp, moduleName);
    }

    async exec(methodName, params) {
        if (!this.module) {
            log &&
                log.error(
                    `Cant exec ${methodName} in module ${this.path}, module not loaded`
                );
            return false;
        }
        await executeObjectFunction(this.module, methodName, [
            this.notApp,
            params,
        ]);
    }

    getStatus() {
        const fieldsList = Object.keys(this.fields);
        const formsList = Object.keys(this.forms);
        const modelsList = Object.keys(this.models);
        const routesList = Object.keys(this.routes);
        const actionsList = this.getActionsList();
        return {
            fields: {
                count: fieldsList.length,
                list: fieldsList,
            },
            forms: {
                count: formsList.length,
                list: formsList,
            },
            models: {
                count: modelsList.length,
                list: modelsList,
                content: this.getModelsStatuses(),
            },
            routes: {
                count: routesList.length,
                list: routesList,
                content: this.getRoutesStatuses(),
            },
            actions: {
                count: actionsList.length,
                list: actionsList,
            },
        };
    }

    getActionsList() {
        let list = [];
        for (let route in this.manifests) {
            if (this.manifests[route] && this.manifests[route].actions) {
                for (let action in this.manifests[route].actions) {
                    list.push(`${route}//${action}`);
                }
            }
        }
        return list;
    }

    getRoutesStatuses() {
        let result = {};
        for (let route in this.manifests) {
            if (this.manifests[route] && this.manifests[route].actions) {
                result[route] = this.manifests[route].actions;
            }
        }
        return result;
    }

    getModelsStatuses() {
        let content = {};
        Object.keys(this.models).forEach((name) => {
            content[name] = this.getModelSchema(name);
        });
        return content;
    }

    setManifest(key, val) {
        this.manifests[key] = val;
    }

    getForm(key) {
        return this.forms[key];
    }

    setForm(key, val) {
        this.forms[key] = val;
    }

    getFormConstructor(key) {
        return this.formsConstructors[key];
    }

    setFormConstructor(key, val) {
        this.formsConstructors[key] = val;
    }

    getFormsConstructors() {
        return this.formsConstructors;
    }

    getField(key) {
        return this.fields[key];
    }

    setField(key, val) {
        this.fields[key] = val;
    }

    setModel(key, val) {
        this.models[key] = val;
    }

    setRoute(key, val) {
        this.routes[key] = val;
    }

    setLogic(key, val) {
        this.logics[key] = val;
    }

    getRoute(routeName) {
        if (this.routes && objHas(this.routes, routeName)) {
            return this.routes[routeName];
        } else {
            return null;
        }
    }

    getRoutes() {
        return this.routes;
    }

    appIsSet() {
        return typeof this.notApp !== "undefined";
    }

    getApp() {
        return this.notApp;
    }

    getName() {
        if (this.module && this.module.name) {
            return this.module.name;
        }
        return this.path;
    }

    getOptions() {
        return this.module && this.module.options ? this.module.options : {};
    }

    setRouteWS({
        collectionType,
        collectionName,
        endPointType,
        wsRouteName,
        action,
        func,
    }) {
        //servers/client
        const collection = this.routesWS[collectionType];
        //concrete client or server
        const wsConnection = collection[collectionName];
        //request, event, response etc
        const endPoints = wsConnection[endPointType];
        //endPoint name
        const endPointName = `${wsRouteName}${DEFAULT_WS_ROUTE_ACTION_SPLITTER}${action}`;
        //finally assigning function
        endPoints[endPointName] = func;
    }

    createEmptyIfNotExistsRouteWSType({
        collectionType, //client, server
        collectionName, //concrete client/server name
        endPointType, //request,event,response, etc
    }) {
        if (!objHas(this.routesWS[collectionType], collectionName)) {
            this.routesWS[collectionType][collectionName] = {};
        }
        if (
            !objHas(this.routesWS[collectionType][collectionName], endPointType)
        ) {
            this.routesWS[collectionType][collectionName][endPointType] = {};
        }
    }

    printOutModuleContent() {
        const status = this.getStatus();
        Object.keys(status).forEach((contentType) => {
            if (status[contentType].count) {
                log &&
                    log.log(
                        `${this.getName()} ${contentType}(${
                            status[contentType].count
                        }): ${status[contentType].list.join(", ")}`
                    );
            }
        });
    }
}

module.exports = notModule;

//importing modules
const protoModel = require('../model/proto.js'),
  fs = require('fs'),
  Auth = require('../auth'),
  logger = require('not-log'),
  log = logger(module, 'notModule'),
  notManifest = require('./manifest.js'),
  notModuleRegistrator = require('./registrator'),
  {objHas, mapBind} = require('../common');


/**
 * Standart splitter of module resources paths
 * @constant
 * @type {string}
 */
const DEFAULT_WS_ROUTE_ACTION_SPLITTER = '//';


/**
 * List of methods to be binded from notApp to notModule
 * @constant
 * @type {string}
 */
const MODULE_BINDINGS_LIST = [
  'getModel',
  'getModelSchema',
  'getModelFile'
];
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
    this.manifests = {};
    this.faulty = false;
    this.paths = {
      routes: {},
      models: {}
    };
    this.fieldsImportRules = (objHas(options, 'fields') && options.fields) ? options.fields : {};

    log.info(`Creating module: ${this.getModuleName()}`);
    this.init();
    return this;
  }

  getModuleName() {
    if(this.module && this.module.name){
      return this.module.name;
    }
    return this.path;
  }

  init() {
    if (this.path) {
      this.initFromPath(this.path);
    } else if (this.module) {
      this.initFromModule(this.module);
    }else{
      return false;
    }
    if (this.module === null || typeof this.module === 'undefined') {
      log.error(`Module ${this.path} not loaded`);
    } else if(this.appIsSet()) {
      mapBind(this.notApp, this.module, MODULE_BINDINGS_LIST);
    }
  }

  initFromPath(modulePath) {
    try {
      if (fs.lstatSync(modulePath).isDirectory()) {
        this.module = require(modulePath);
        notModuleRegistrator.registerContent({nModule: this});
      }else{
        return false;
      }
    } catch (e) {
      this.faulty = true;
      log.error(e);
    }
  }

  initFromModule() {
    try {
      notModuleRegistrator.registerContent({nModule: this});
    } catch (e) {
      this.faulty = true;
      log.error(e);
    }
  }

  getEndPoints() {
    return this.routesWS;
  }

  getManifest({
    auth,
    role,
    root
  } = {
    auth: false,
    role: Auth.DEFAULT_USER_ROLE_FOR_GUEST,
    root: false
  }) {
    return this.manifest.filterManifest(
      this.manifests,
      auth,
      role,
      root
    );
  }
  /*
  getActionManifest({auth, role, root}){

  }
  */
  getModelFile(modelName) {
    if (this.models && objHas(this.models, modelName)) {
      return this.models[modelName];
    } else {
      return null;
    }
  }

  getModel(modelName) {
    let modelFile = this.getModelFile(modelName);
    if (modelFile && (modelName in modelFile)) {
      return modelFile[modelName];
    } else {
      return null;
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
    if (logicFile && (logicName in logicFile)) {
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

  fabricateModel(model) {
    protoModel.fabricate(model, {}, this.mongoose);
  }

  fabricateModels() {
    for (let modelName in this.models) {
      log.info(`Fabricating model: ${modelName}`);
      this.fabricateModel(this.models[modelName]);
    }
  }

  expose(app, moduleName) {
    if (this.manifests && app) {
      this.fabricateModels();
      this.initManifest(app, moduleName);
      this.manifest.registerRoutes(this.manifests);
    }
  }

  initManifest(app, moduleName){
    this.manifest = new notManifest(app, this.notApp, moduleName);
  }

  async exec(methodName) {
    if (!this.module) {
      log.error(`Cant exec ${methodName} in module ${this.path}, module not loaded`);
      return false;
    }
    if ((objHas(this.module, methodName)) &&
      (typeof this.module[methodName] === 'function')
    ) {
      try {
        if (this.module[methodName].constructor.name === 'AsyncFunction') {
          await this.module[methodName](this.notApp);
        } else {
          this.module[methodName](this.notApp);
        }
        return true;
      } catch (e) {
        log.error(e);
        return false;
      }
    }else{
      return false;
    }
  }

  getStatus() {
    const formsList = Object.keys(this.forms);
    const modelsList = Object.keys(this.models);
    const routesList = Object.keys(this.routes);
    const actionsList = this.getActionsList();
    return {
      forms: {
        count: formsList.length,
        list: formsList
      },
      models: {
        count: modelsList.length,
        list: modelsList,
        content: this.getModelsStatuses()
      },
      routes: {
        count: routesList.length,
        list: routesList,
        content: this.getRoutesStatuses()
      },
      actions: {
        count: actionsList.length,
        list: actionsList
      }
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

  setManifest(key, val){
    this.manifests[key] = val;
  }

  getForm(key) {
    return this.forms[key];
  }

  setForm(key, val) {
    this.forms[key] = val;
  }

  setModel(key, val){
    this.models[key] = val;
  }

  setRoute(key, val){
    this.routes[key] = val;
  }

  setLogic(key, val){
    this.logics[key] = val;
  }

  getRoute(routeName) {
    if (this.routes && objHas(this.routes, routeName)) {
      return this.routes[routeName];
    } else {
      return null;
    }
  }

  appIsSet(){
    return typeof this.notApp !== 'undefined';
  }

  getApp(){
    return this.notApp;
  }

  getName(){
    return this.module.name;
  }

  setRouteWS({
    collectionType,
    collectionName,
    endPointType,
    wsRouteName,
    action,
    func
  }) {
    //servers/client
    const collection = this.routesWS[collectionType];
    //concrete client or server
    const wsConnection =  collection[collectionName];
    //request, event, response etc
    const endPoints = wsConnection[endPointType];
    //endPoint name
    const endPointName = `${wsRouteName}${DEFAULT_WS_ROUTE_ACTION_SPLITTER}${action}`;
    //finally assigning function
    endPoints[endPointName] = func;
  }

  createEmptyIfNotExistsRouteWSType(
    {
      collectionType, //client, server
      collectionName, //concrete client/server name
      endPointType    //request,event,response, etc
    }
  ) {
    if (!objHas(this.routesWS[collectionType], collectionName)) {
      this.routesWS[collectionType][collectionName] = {};
    }
    if (!objHas(this.routesWS[collectionType][collectionName], endPointType)) {
      this.routesWS[collectionType][collectionName][endPointType] = {};
    }
  }

}

module.exports = notModule;

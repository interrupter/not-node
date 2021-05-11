//importing modules
const protoModel = require('../model/proto.js'),
  fs = require('fs'),
  path = require('path'),
  Auth = require('../auth/auth.js'),
  Fields = require('../fields.js'),
  notLocale = require('not-locale'),
  logger = require('not-log'),
  log = logger(module, 'notModule'),
  notManifest = require('./manifest.js');

//defining CONSTS
const DEFAULT_MANIFEST_FILE_ENDING = '.manifest.js';
const DEFAULT_WS_ROUTE_ACTION_SPLITTER = '//';
/**
 *	Module representation
 *	@class
 *	@param	{object} 	options			options
 **/
class notModule {
  constructor(options) {
    log.info(`Creating module: ${options.modPath}`);
    this.path = options.modPath;
    this.module = options.modObject;
    this.mongoose = options.mongoose;
    this.notApp = options.notApp;
    this.fieldsImportRules = (Object.prototype.hasOwnProperty.call(options, 'fields') && options.fields) ? options.fields : {};
    this.description = {};
    this.routes = {};
    this.wsEndPoints = {
      servers: {},
      clients: {},
    };
    this.models = {};
    this.logics = {};
    this.mixins = {};
    this.manifests = {};
    this.faulty = false;
    this.paths = {
      routes: {},
      models: {}
    };
    this.init();
    return this;
  }

  getModuleName() {
    return this.description.name || this.module.name || this.path;
  }

  map(to, list) {
    for (let item of list) {
      if (typeof this[item] === 'function') {
        to[item] = this[item].bind(this.notApp);
      }
    }
  }

  init() {
    if (this.path) {
      this.initFromPath(this.path);
    } else if (this.module) {
      this.initFromModule(this.module);
    }
    if (this.module === null || typeof this.module === 'undefined') {
      log.error(`Module ${this.path} not loaded`);
    } else {
      this.map(this.module, [
        'getModel',
        'getModelSchema',
        'getModelFile'
      ]);
    }
  }

  initFromPath(modulePath) {
    try {
      if (fs.lstatSync(modulePath).isDirectory()) {
        this.module = require(modulePath);
        this.registerContent();
      }
    } catch (e) {
      this.faulty = true;
      log.error(e);
    }
  }

  initFromModule() {
    try {
      this.registerContent();
    } catch (e) {
      this.faulty = true;
      log.error(e);
    }
  }

  registerContent() {
    if (this.module.paths) {
      if (this.module.paths.fields) {
        this.findFieldsIn(this.module.paths.fields);
      }
      if (this.module.paths.models) {
        this.findModelsIn(this.module.paths.models);
      }
      if (this.module.paths.mixins) {
        this.findMixinsIn(this.module.paths.mixins);
      }
      if (this.module.paths.logics) {
        this.findLogicsIn(this.module.paths.logics);
      }
      if (this.module.paths.routes) {
        this.findRoutesIn(this.module.paths.routes);
      }
      if (this.module.paths.locales) {
        notLocale.fromDir(this.module.paths.locales);
      }
    }
  }

  findLogicsIn(logicsPath) {
    fs.readdirSync(logicsPath).forEach((file) => {
      let logicPath = path.join(logicsPath, file);
      log.info(`Checking logic in ${logicPath}`);
      if (fs.lstatSync(logicPath).isFile()) {
        let logic = require(logicPath),
          logicName = file;
        if (logic && logic.thisLogicName) {
          logicName = logic.thisLogicName;
        }
        logic.filename = logicPath;
        this.registerLogic(logic, logicName);
      }
    });
  }

  findModelsIn(modelsPath) {
    fs.readdirSync(modelsPath).forEach((file) => {
      let modelPath = path.join(modelsPath, file);
      log.info(`Checking model in ${modelPath}`);
      if (fs.lstatSync(modelPath).isFile()) {
        let model = require(modelPath),
          modelName = file;
        if (model && model.thisModelName) {
          modelName = model.thisModelName;
        }
        model.filename = modelPath;
        this.registerModel(model, modelName);
      }
    });
  }

  findMixinsIn(mixinsPath) {
    fs.readdirSync(mixinsPath).forEach((file) => {
      let mixinPath = path.join(mixinsPath, file);
      if (fs.lstatSync(mixinPath).isFile()) {
        let mixin = require(mixinPath),
          modelName = file;
        if (mixin && mixin.modelName) {
          modelName = mixin.modelName;
        }
        mixin.filename = mixinPath;
        this.registerMixin(mixin, modelName);
      }
    });
  }

  findFieldsIn(fieldsDir) {
    fs.readdirSync(fieldsDir).forEach((file) => {
      let fieldsPath = path.join(fieldsDir, file);
      if (fs.lstatSync(fieldsPath).isFile()) {
        let fields = require(fieldsPath);
        if (fields && Object.prototype.hasOwnProperty.call(fields, 'FIELDS')) {
          Fields.registerFields(fields.FIELDS, this.fieldsImportRules);
        } else {
          let parts = path.parse(fieldsPath);
          Fields.registerField(parts.name, fields, this.fieldsImportRules);
        }
      }
    });
  }

  tryFile(filePath){
    try{
      return fs.lstatSync(filePath) && fs.lstatSync(filePath).isFile();
    }catch(e){
      return false;
    }
  }

  findRoutesIn(routesPath) {
    fs.readdirSync(routesPath).forEach((file) => {
      this.findRouteIn(file, routesPath);
    });
  }

  findRouteIn(file, routesPath) {
    try {
      //если имя похоже на название манифеста
      if (file.indexOf(DEFAULT_MANIFEST_FILE_ENDING) > -1) {
        let routeBasename = file.substr(0, file.indexOf(DEFAULT_MANIFEST_FILE_ENDING)),
          routePath = path.join(routesPath, routeBasename + '.js'),
          routeWSPath = path.join(routesPath, routeBasename + '.ws.js'),
          routeManifestPath = path.join(routesPath, file);
        let routeManifest,
          route,
          wsEndPoints,
          routeName = routeBasename,
          wsRouteName = routeBasename;
        //проверяем есть ли файл роутов и манифеста
        if (this.tryFile(routeManifestPath)) {
          routeManifest = require(routeManifestPath);
        }
        if (this.tryFile(routePath)) {
          route = require(routePath);
          if (route && route.thisRouteName) {
            routeName = route.thisRouteName;
          }
          route.filename = routePath;
        }
        if (this.tryFile(routeWSPath)) {
          wsEndPoints = require(routeWSPath);
          if (wsEndPoints && wsEndPoints.thisRouteName) {
            wsRouteName = wsEndPoints.thisRouteName;
          }
        }
        if (routeManifest && (route || wsEndPoints)) {
          this.registerManifest(routeManifest, routeName);
          if (route) {
            this.registerRoute(route, routeName);
          }
          if (wsEndPoints) {
            this.registerWSEndPoints(wsEndPoints, wsRouteName);
          }
        }
      }
    } catch (e) {
      log.error(e);
    }
  }

  registerLogic(logic, logicName) {
    if (this.notApp) {
      log.debug(`Register logic ${logicName}`);
      logic.getLogic = this.notApp.getLogic.bind(this.notApp);
      logic.getLogicFile = this.notApp.getLogicFile.bind(this.notApp);
      logic.getModule = this.notApp.getModule.bind(this.notApp);
      logic.log = logger(logic, `Logic#${logicName}`);
    } else {
      log.debug(`Register logic ${logicName} skiped, no Application`);
    }
    logic.getThisModule = () => this;
    this.logics[logicName] = logic;
  }

  registerModel(model, modelName) {
    if (this.notApp) {
      log.debug(`Register model ${modelName}`);
      model.getModel = this.notApp.getModel.bind(this.notApp);
      model.getModelFile = this.notApp.getModelFile.bind(this.notApp);
      model.getModelSchema = this.notApp.getModelSchema.bind(this.notApp);
      model.getModule = this.notApp.getModule.bind(this.notApp);
      model.log = logger(model, `Model#${modelName}`);
    } else {
      log.debug(`Register model ${modelName} skiped, no Application`);
    }
    model.getThisModule = () => this;
    this.models[modelName] = model;
  }

  registerMixin(mixin, modelName) {
    this.mixins[modelName] = mixin;
  }

  registerRoute(route, routeName) {
    this.routes[routeName] = route;
    if (this.notApp) {
      log.debug(`Register route ${routeName}`);
      route.getLogic = this.notApp.getLogic.bind(this.notApp);
      route.getLogicFile = this.notApp.getLogicFile.bind(this.notApp);
      route.getModel = this.notApp.getModel.bind(this.notApp);
      route.getModelFile = this.notApp.getModelFile.bind(this.notApp);
      route.getModelSchema = this.notApp.getModelSchema.bind(this.notApp);
      route.getModule = this.notApp.getModule.bind(this.notApp);
      route.log = logger(route, `Route#${routeName}`);
    } else {
      log.debug(`Register route ${routeName} skiped, no Application`);
    }
    route.getThisModule = () => this;
  }

  registerManifest(manifest, routeName) {
    this.manifests[routeName] = manifest;
  }

  bindWSEndPointEntityFunctions(wsEndPoints, wsRouteName, collectionType){
    if(Object.prototype.hasOwnProperty.call(wsEndPoints, collectionType)){
      Object.keys(wsEndPoints[collectionType]).forEach((collectionItem) => {
        const entity = wsEndPoints[collectionType][collectionItem];
        entity.getLogic = this.notApp.getLogic.bind(this.notApp);
        entity.getLogicFile = this.notApp.getLogicFile.bind(this.notApp);
        entity.getModel = this.notApp.getModel.bind(this.notApp);
        entity.getModelFile = this.notApp.getModelFile.bind(this.notApp);
        entity.getModelSchema = this.notApp.getModelSchema.bind(this.notApp);
        entity.getModule = this.notApp.getModule.bind(this.notApp);
        Object.keys(entity).forEach((endPointType) => {
          this.checkWSEndPointType(collectionType, collectionItem, endPointType);
          Object.keys(entity[endPointType]).forEach((endPointName) => {
            this.addEndPoint(
              collectionType, collectionItem,
              endPointType, wsRouteName,
              endPointName,
              entity[endPointType][endPointName]
            );
          });
        });
      });
    }
  }

  registerWSEndPoints(wsEndPoints, wsRouteName) {
    if (this.notApp) {
      this.bindWSEndPointEntityFunctions(wsEndPoints, wsRouteName, 'servers');
      this.bindWSEndPointEntityFunctions(wsEndPoints, wsRouteName, 'clients');
    }
  }

  checkWSEndPointType(collectionType, collectionItem, endPointType) {
    if (!Object.prototype.hasOwnProperty.call(this.wsEndPoints[collectionType], collectionItem)) {
      this.wsEndPoints[collectionType][collectionItem] = {};
    }
    if (!Object.prototype.hasOwnProperty.call(this.wsEndPoints[collectionType][collectionItem], endPointType)) {
      this.wsEndPoints[collectionType][collectionItem][endPointType] = {};
    }
  }

  addEndPoint(collectionType, collectionItem, endPointType, wsRouteName, action, func) {
    this.wsEndPoints[collectionType][collectionItem][endPointType][`${wsRouteName}${DEFAULT_WS_ROUTE_ACTION_SPLITTER}${action}`] = func;
  }

  getEndPoints() {
    return this.wsEndPoints;
  }

  getManifest(req) {
    if (req) {
      let user = {
        auth: Auth.isUser(req),
        role: Auth.getRole(req),
        root: Auth.isRoot(req),
      };
      let filtered = this.manifest.filterManifest(
        this.manifests,
        user.auth,
        user.role,
        user.root
      );
      return filtered;
    } else {
      return this.manifests;
    }
  }

  getModelFile(modelName) {
    if (this.models && Object.prototype.hasOwnProperty.call(this.models, modelName)) {
      return this.models[modelName];
    } else {
      return null;
    }
  }

  getModel(modelName) {
    try {
      let modelFile = this.getModelFile(modelName);
      if (modelFile && (modelName in modelFile)) {
        return modelFile[modelName];
      } else {
        return null;
      }
    } catch (e) {
      log.error(e);
    }
  }

  getLogicFile(logicName) {
    if (this.logics && Object.prototype.hasOwnProperty.call(this.logics, logicName)) {
      return this.logics[logicName];
    } else {
      return null;
    }
  }

  getLogic(logicName) {
    try {
      let logicFile = this.getLogicFile(logicName);
      if (logicFile && (logicName in logicFile)) {
        return logicFile[logicName];
      } else {
        return null;
      }
    } catch (e) {
      log.error(e);
    }
  }


  getModelSchema(modelName) {
    let modelFile = this.getModelFile(modelName);
    if (modelFile && Object.prototype.hasOwnProperty.call(modelFile, modelName) && modelFile.thisSchema) {
      return modelFile.thisSchema;
    }
    return null;
  }

  getMixin(modelName) {
    if (this.mixins && Object.prototype.hasOwnProperty.call(this.mixins, modelName)) {
      return this.mixins[modelName];
    } else {
      return null;
    }
  }

  getRoute(routeName) {
    if (this.routes && Object.prototype.hasOwnProperty.call(this.routes, routeName)) {
      return this.routes[routeName];
    } else {
      return null;
    }
  }

  fabricateModel(model, mixins) {
    if (mixins && Array.isArray(mixins) && mixins.length) {
      for (let mixin of mixins) {
        if (model.thisSchema && mixin.schema) {
          model.thisSchema = Object.assign(model.thisSchema, mixin.schema);
        }
        if (model.thisMethods && mixin.methods) {
          model.thisMethods = Object.assign(model.thisMethods, mixin.methods);
        }
        if (model.thisStatics && mixin.statics) {
          model.thisStatics = Object.assign(model.thisStatics, mixin.statics);
        }
        if (model.thisVirtuals && mixin.virtuals) {
          model.thisVirtuals = Object.assign(model.thisVirtuals, mixin.virtuals);
        }
      }
    }
    protoModel.fabricate(model, {}, this.mongoose);
  }

  fabricateModels() {
    for (let modelName in this.models) {
      log.info(`Fabricating model: ${modelName}`);
      let modelMixins = [];
      if (this.notApp) {
        modelMixins = this.notApp.getModelMixins(modelName);
      }
      this.fabricateModel(this.models[modelName], modelMixins);
    }
  }

  expose(app, moduleName) {
    if (this.manifests && app) {
      this.fabricateModels();
      this.manifest = new notManifest(app, this.notApp, moduleName);
      this.manifest.registerRoutes(this.manifests);
    }
  }

  exec(methodName) {
    if (this.module) {
      if (Object.prototype.hasOwnProperty.call(this.module, methodName)) {
        if (typeof this.module[methodName] === 'function') {
          try {
            this.module[methodName](this.notApp);
          } catch (e) {
            log.error(e);
          }
        }
      }
    } else {
      log.error(`Cant exec ${methodName} in module ${this.path}, module not loaded`);
    }
  }

  getStatus() {
    const modelsList = Object.keys(this.models);
    const routesList = Object.keys(this.routes);
    const actionsList = this.getActionsList();
    let status = {
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
    return status;
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

}

module.exports = notModule;

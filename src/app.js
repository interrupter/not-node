const notDomain = require('./domain');
const extend = require('extend');
const parent = require('../index.js');
const log = require('not-log')(module, 'notApp');
const notPath = require('not-path');

var
  notWSServer,
  notWSClient,
  notWSRouter,
  notWSMessenger;

const DEFAULT_WS_SERVER_NAME = 'main';
/**
 *	Application
 *	@class
 *	@param {object}	options	application options
 *	{
 *		mongoose: mongooseConnectionToDB
 *		modulesCollectionPaths: [__dirname + '/modules'], 	//each path to folder with modules
 *		modulesPaths: [],									//each path to module
 *		modules: {
 *			filestore: require('not-filestore') 			//each npm not-* module with custom overriden name as key
 *		}
 *	}
 *	@example <caption>Application creation routine</caption>
 *	let App = new notApp({
 *		mongoose: mongooseLink
 *		modulesCollectionPaths: [__dirname + '/modules'], //each path to folder with modules
 *		modulesPaths: [],	//each path to module
 *		modules: {
 *			filestore: require('not-filestore') //each npm not-* module with custom overriden name as key
 *		}
 *	})
 *		.importModuleFrom(__dirname+'/anotherModule', 'anotherCustomModuleName')	//import module from path
 *		.importModulesFrom(__dirname+'/directoryOfUsefullessModules')
 *		.importModule(require('notModule'), 'notModule')
 *		.expose(ExpressApp);
 **/
class notApp extends notDomain {
  static DEFAULT_WS_SERVER_NAME = DEFAULT_WS_SERVER_NAME;
  constructor(options) {
    super(options);
    this.__WS = {
      servers:{},
      clients:{}
    };
    parent.Application = this;
    return this;
  }

  /**
   *	Returns application manifest
   *	@params		{object}	req 			Express request object
   *	@return 	{object}	manifest
   **/
  getManifest(req) {
    let manifest = {};
    for (let modName of Object.keys(this.modules)) {
      manifest = extend(manifest, this.modules[modName].getManifest(req));
    }
    this.requiredManifests = manifest;
    return manifest;
  }

  /**
   *	Exposes routes to ExpressJS application
   *	@param {object} 	app	ExpressJS application instance
   **/
  expose(app) {
    if (this.modules) {
      for (let t of Object.keys(this.modules)) {
        let mod = this.modules[t];
        if (mod) {
          if (mod.expose) {
            mod.expose(app, t);
          }
          this.collectWSEndPoints(mod);
        }
      }
      this.exposeWS();
    }
  }

  collectWSEndPoints(mod) {
    let eps = mod.getEndPoints();
    if (eps) {
      for (let collectionType in eps) {//{servers, clients}
        for(let collectionName in eps[collectionType]){
          const collection = eps[collectionType][collectionName];
          for (let messageType in collection) {
            for (let messageName in collection[messageType]) {
              this.addWSAction(
                collectionType,
                collectionName,
                messageType,
                messageName,
                collection[messageType][messageName]
              );
            }
          }
        }
      }
    }
  }

  getWSEndPointServerName(endPoint){
    return Object.prototype.hasOwnProperty.call(endPoint, 'serverName')?endPoint.serverName:DEFAULT_WS_SERVER_NAME;
  }

  addWSAction(
    collectionType,
    collectionName,
    messageType,
    messageName,
    endPoint
  ) {
    notPath.setValueByPath(
      this.__WS,
      [collectionType,collectionName,messageType,messageName].join('.'), //servers.main.request.modelName//actionName
      endPoint
    );
  }

  hasWSEndPoints(owner) {
    return Object.keys(owner).length;
  }

  exposeWS() {
    //include only in case
    try {
      const notWS = require('not-ws');
      notWSServer = notWS.notWSServer;
      notWSClient = notWS.notWSClient;
      notWSRouter = notWS.notWSRouter;
      notWSMessenger = notWS.notWSMessenger;
      const opts = this.getEnv('WS');
      if(typeof opts !== 'undeifned'){
        log.log('WS', opts);
        if (this.hasWSEndPoints(this.__WS.servers)){
          if(Object.prototype.hasOwnProperty.call(opts, 'servers')){
            for(let serverName in opts.servers){
              log.log(serverName, opts.servers[serverName]);
              this.initWSServer(serverName, opts.servers[serverName]);
            }
          }
        }
        if (this.hasWSEndPoints(this.__WS.clients)) {
          if(Object.prototype.hasOwnProperty.call(opts, 'clients')){
            for(let clientName in opts.clients){
              this.initWSClient(clientName, opts.clients[clientName]);
            }
          }
        }
      }else{
        log.log('WS options is not defined');
      }
    } catch (e) {
      log.error(e);
    }
  }

  initWSServer(serverName = DEFAULT_WS_SERVER_NAME, opts) {
    log.info(`Starting WSServer(${serverName})...`);
    try {
      if(!opts){
        log.log(opts);
        throw new Error(`No WS server(${serverName}) options`);
      }
      const secure = opts.secure;
			const types = this.getWSTypes('servers', serverName, opts);
      const validators = this.getWSValidators('servers', serverName, opts);
      const serverRoutes = this.__WS.servers[serverName];
      log.log(JSON.stringify(types, null, 4));
      const WSServer = new notWSServer({
        port: opts.port,
        getRouter(){
          return new notWSRouter({}, serverRoutes);
        },
        getMessenger() {
          return new notWSMessenger({
            validateTypeAndName: false,
            secure,
            types,
            validators
          });
        },
        secure,
        jwt: {
          key: opts.secret
        }
      });
      this.addWSServer(serverName, WSServer);
      WSServer.start();
      log.info(`WS server(${serverName}) listening on port ` + opts.port);
    } catch (e) {
      log.error(`WS server(${serverName}) startup failure`);
      log.error(e);
    }
  }

  initWSClient(clientName, opts) {
    log.info(`Starting WSClient(${clientName})...`);
    try {
      if(!opts){
        throw new Error(`No WS client(${clientName}) options`);
      }
      const helpers = this.getWSHelpers('clients', clientName);
      const WSClient = new notWSClient({
        options:{
          host: opts.host,
          port: opts.port,
          path: '',
          ping: !!opts.ping,
          secure: opts.secure,
          logger: this.logger,
          getToken: helpers && helpers.getToken ? helpers.getToken: undefined,
        },
        router: this.getWSClientRouter(clientName, opts),
        messenger: this.getWSClientMessenger(clientName, opts),
      });
      this.addWSClient(clientName, WSClient);
      log.info(`WS server(${clientName}) connected to `+ opts.host+ ':' + opts.port);
    } catch (e) {
      log.error(`WS server(${clientName}) startup failure`);
      log.error(e);
    }
  }

  getWSHelpers(type = 'clients', name){
    if(
      this.getEnv('WSHelpers') &&
      this.getEnv('WSHelpers')[type] &&
      this.getEnv('WSHelpers')[type][name]
    ){
      return this.getEnv('WSHelpers')[type][name];
    }else{
      return false;
    }
  }

  getWSClientRouter(name, opts){
    let routes = {};
    if(Object.prototype.hasOwnProperty.call(this.__WS.clients, name)){
      routes = this.__WS.clients[name];
    }
    return new notWSRouter(opts.router || {}, routes);
  }

  getWSClientMessenger(name = DEFAULT_WS_SERVER_NAME, opts){
    log.log('creating client', name);
    const options = {
			secure: opts.secure,
			types: this.getWSTypes('clients', name, opts),
      validators: this.getWSValidatorsForClient(name, opts)
		};
    if(Object.prototype.hasOwnProperty.call(opts, 'validateType')){
      options.validateType = opts.validateType;
    }
    if(Object.prototype.hasOwnProperty.call(opts, 'validateTypeAndName')){
      options.validateTypeAndName = opts.validateTypeAndName;
    }
    return new notWSMessenger(options);
  }

  getWSValidatorsForServer(name = DEFAULT_WS_SERVER_NAME, opts){
    return this.getWSValidators(opts, 'servers', name);
  }

  getWSValidatorsForClient(name = DEFAULT_WS_SERVER_NAME, opts){
    return this.getWSValidators('clients', name, opts);
  }

  getWSValidators(type = 'servers', name = DEFAULT_WS_SERVER_NAME, opts){
    if(
      this.getEnv('WSValidators') &&
      this.getEnv('WSValidators')[type] &&
      this.getEnv('WSValidators')[type][name]
    ){
      return this.getEnv('WSValidators')[type][name];
    }else if(opts.validators){
      return opts.validators;
    }else{
      const jwt = require('jsonwebtoken');
      return {};
    }
  }

  getWSTypes(collectionType = 'servers', collectionName = DEFAULT_WS_SERVER_NAME, opts){
    if(this.getEnv('WSTypes') && this.getEnv('WSTypes')[collectionType] && this.getEnv('WSTypes')[collectionType][collectionName]){
      return this.getEnv('WSTypes')[collectionType][collectionName];
    }else if(opts.types){
      return opts.types;
    }else{
      const types = {};
      for(let type in this.__WS[collectionType][collectionName]){
        types[type] = Object.keys(this.__WS[collectionType][collectionName][type]);
      }
      types['__service'] = ['updateToken'];
      return types;
    }
  }

}

module.exports = notApp;

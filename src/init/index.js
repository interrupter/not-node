//
const path = require('path');
const logger = require('not-log');
const log = logger(module, 'not-node:Init');
//
const ADDS = require('./additional');
//
const initEnv = require('./env');
const initDB = require('./db');
const initServer = require('./server');
const initSessions = require('./sessions');
const initTemplate = require('./template');
const initCORS = require('./cors');
const initMiddleware = require('./middleware');
const initRoutes = require('./routes');
const initModules = require('./modules');
const initInformer = require('./informer');
const initHTTP = require('./http');
const initMonitoring = require('./monitoring');

class Init {
  static options = false;
  static manifest = false;
  static config = false;
  static mongoose = false;
  static notApp = false;
  static server = false;
  static httpServer = false;
  static WSServer = false;
  static WSClient = false;

  static getAbsolutePath(subPath, options){
    return path.resolve(options.pathToApp, subPath);
  }

  static setManifest(manifest) {
    this.manifest = manifest;
  }

  static setMongoose(val) {
    this.mongoose = val;
  }

  static getMongoose() {
    return this.mongoose;
  }

  static setServer(val){
    this.server = val;
    return this;
  }

  static getServer(){
    return this.server;
  }

  static setHTTPServer(val){
    this.httpServer = val;
    return this;
  }

  static getHTTPServer(){
    return this.httpServer;
  }

  static getApp(){
    return this.notApp;
  }

  static setApp(val){
    this.notApp = val;
    return this;
  }

  static initConfig(config = false) {
    if (!config) {
      this.config = require('not-config').createReader();
    } else {
      this.config = config;
    }
  }

  static printOutManifest = () => {
    log.debug('Manifest:');
    log.debug(JSON.stringify(this.notApp.getManifest(), null, 4));
  }

  /**
   * Initalization of Application
   *
   * @param {Object} params hash with few possible object
   * @param {Object} params.config  nconf like reader {get:(key)=>any, set:(key, value)=>void}
   * @param {Object} params.options paths infrastructure options
   * @param {Object} params.manifest application manifest
   * @param {Object} params.additional pre/mid/post actions for every major step of initialization {stepName: {pre: async()=>void, post: async()=>void, [key: string]=> async()=>void}}
   **/

  static async run({
    config,
    options,
    manifest,
    additional
  }) {
    try {
      log.info('Kick start app...');
      ADDS.init(additional);
      await ADDS.run('pre', {
        config,
        options,
        manifest,
        additional
      });
      //setting basic resources
      this.options = options; // pathToApp, pathToNPM
      this.setManifest(manifest);
      //adopting provided config store or initializing own
      this.initConfig(config);
      //creating context for other init runners
      const context = {
        config: this.getConfig(), //access to config
        options, //options
        master: Init //this class
      };
      //creating set of variables derived from basic ones, such as various paths, server names and URIs
      await initEnv.run({ ...context});
      //DB access
      await initDB.run({ ...context});
      //https server
      await initServer.run({ ...context});
      //user sessions
      await initSessions.run({ ...context});
      //template engine
      await initTemplate.run({ ...context});
      //CORS rules
      await initCORS.run({...context});
      //various not-* middleware from all sources
      await initMiddleware.run({ ...context});
      await initRoutes.run({ ...context});
      await initModules.run({ ...context});
      //messaging platform
      await initInformer.run({ ...context});
      await initHTTP.run({ ...context});
      await initMonitoring.run({ ...context});
    } catch (e) {
      this.throwError(e.message, 1);
    }

  }

  static throwError(errMsg = 'Fatal error', errCode = 1) {
    log.error(errMsg);
    log.log(`Exit process...with code ${errCode}`);
    throw new Error(errMsg);
  }

}

module.exports.Init = Init;

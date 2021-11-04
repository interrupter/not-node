//
const path = require('path');
const logger = require('not-log');
const log = logger(module, 'not-node:Init');
//
const ADDS = require('./additional');
//
const InitSequence = require('./sequence.js');
const STANDART_INIT_SEQUENCE = require('./sequence.standart.js');

class Init{
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
    Init.manifest = manifest;
  }

  static setMongoose(val) {
    Init.mongoose = val;
  }

  static getMongoose() {
    return Init.mongoose;
  }

  static setServer(val){
    Init.server = val;
    return Init;
  }

  static getServer(){
    return Init.server;
  }

  static setHTTPServer(val){
    Init.httpServer = val;
    return Init;
  }

  static getHTTPServer(){
    return Init.httpServer;
  }

  static getApp(){
    return Init.notApp;
  }

  static setApp(val){
    Init.notApp = val;
    return Init;
  }

  static initConfig(config = false) {
    if (!config) {
      Init.config = require('not-config').createReader();
    } else {
      Init.config = config;
    }
  }

  static getConfig() {
    return Init.config;
  }

  static printOutManifest = () => {
    log.debug('Manifest:');
    log.debug(JSON.stringify(Init.notApp.getManifest(), null, 4));
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
      const initSequence = new InitSequence(STANDART_INIT_SEQUENCE);
      await ADDS.run('pre', {
        config,
        options,
        manifest,
        additional,
        initSequence //giving a chance to change init sequence
      });
      //setting basic resources
      Init.options = options; // pathToApp, pathToNPM
      Init.setManifest(manifest);
      //adopting provided config store or initializing own
      Init.initConfig(config);
      //creating context for other init runners
      const context = {
        config: Init.getConfig(), //access to config
        options, //options
        master: Init //this class
      };
      //running all prepared initalizers with current context
      await initSequence.run(context);
      log.info('Application initalization finished');
    } catch (e) {
      Init.throwError(e.message, 1);
    }
  }

  static throwError(errMsg = 'Fatal error', errCode = 1) {
    log.error(errMsg);
    log.log(`Exit process...with code ${errCode}`);
    throw new Error(errMsg);
  }

}

module.exports.Init = Init;

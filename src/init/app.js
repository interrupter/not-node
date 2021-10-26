const notAppConstructor = require('../app.js');
const ENV = (process.env.NODE_ENV || 'development');
const path = require('path');
const logger = require('not-log');
const log = logger(module, 'not-node//init');
const {
  notErrorReporter
} = require('not-error');

const emit = require('./additional').run;

module.exports = class InitApp{

  static async createApp({config, options, master}){
    await emit('app.create.pre', {config, options, master});
    master.setApp(new notAppConstructor({mongoose: master.getMongoose()}));
    await emit('app.create.post', {config, options, master});
  }

  static async setAppEnvs({config, options, master}){
    await emit('app.setEnv.pre', {config, options, master});
    master.getApp().setEnv('hostname', config.get('hostname'));
    master.getApp().setEnv('server', `https://` + config.get('host'));
    master.getApp().setEnv('appPath', config.get('appPath'));
    master.getApp().setEnv('name', master.getManifest().name);
    master.getApp().setEnv('fullServerName', config.get('fullServerName'));
    master.getApp().setEnv('dbDumpsPath', config.get('dbDumpsPath'));
    master.getApp().setEnv('rolesPriority', master.getManifest().targets.server.roles);
    master.getApp().ENV = ENV;
    await emit('app.setEnv.post', {config, options, master});
  }

  static async importModules({config, options, master}){
    await emit('app.importModules.pre', {config, options, master});
    master.getApp().importModulesFrom(config.get('modulesPath'));
    if (Array.isArray(config.get('importModulesFromNPM'))) {
      config.get('importModulesFromNPM').forEach((modName) => {
        master.getApp().importModuleFrom(path.join(config.get('npmPath'), modName), modName);
      });
    }
    await emit('app.importModules.post', {config, options, master});
  }


  static async createReporter({config,/* options,*/ master}){
    try {
      master.getApp().reporter = new notErrorReporter({
        origin:{
          server: config.get('host')
        },
      });
      master.getApp().logger = logger(module, 'notApplication');
    } catch (e) {
      log.error(e);
    }
  }

  static async run({config, options, master}) {
    try{
      log.info('Init not-app...');
      await emit('app.pre', {config, options, master});
      await InitApp.createApp({config, options, master});
      await InitApp.setAppEnvs({config, options, master});
      await InitApp.importModules({config, options, master});
      await InitApp.createReporter({config, options, master});
    }catch(e){
      master.throwError(e.message, 1);
    }

  }

};

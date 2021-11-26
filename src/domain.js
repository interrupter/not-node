/**
 *  Not an App,
 *  But can be used for hosting modules and models.
 *
 */
const EventEmitter = require('events');
const {isFunc,isAsync, objHas, firstLetterToUpper} = require('./common');

const Env = require('./env');
const
  notModule = require('./manifest/module'),
  path = require('path'),
  fs = require('fs');

const OPT_DEFAULT_SHUTDOWN_TIMEOUT = 5000;

/**
 *  Domain
 *  @class
 *  @param {object}  options  application options
 *  {
 *    mongoose: mongooseConnectionToDB
 *    modulesCollectionPaths: [__dirname + '/modules'],   //each path to folder with modules
 *    modulesPaths: [],                  //each path to module
 *    modules: {
 *      filestore: require('not-filestore')       //each npm not-* module with custom overriden name as key
 *    }
 *  }
 *  @example <caption>Domain creation routine</caption>
 *  let App = new new notDomain({
 *    mongoose: mongooseLink
 *    modulesCollectionPaths: [__dirname + '/modules'], //each path to folder with modules
 *    modulesPaths: [],  //each path to module
 *    modules: {
 *      filestore: require('not-filestore') //each npm not-* module with custom overriden name as key
 *    }
 *  })
 *    .importModuleFrom(__dirname+'/anotherModule', 'anotherCustomModuleName')  //import module from path
 *    .importModulesFrom(__dirname+'/directoryOfUsefullessModules')
 *    .importModule(require('notModule'), 'notModule');
 **/
class notDomain extends EventEmitter {
  static OPT_DEFAULT_SHUTDOWN_TIMEOUT = OPT_DEFAULT_SHUTDOWN_TIMEOUT;
  constructor(options) {
    super();
    this.options = options;
    //named array of notModules wrappers for notModule format modules
    this.modules = {};
    this._logger = null;
    this._reporter = null;
    this._informer = null;
    //named ws servers
    this._wss = {};
    //named ws clients
    this._wsc = {};
    //store
    this.envs = {};
    return this;
  }

  /**
   *  Cycles throu all imported modules, passes name, module, and itself
   *  to argument function
   *  @param   {function}  func  function to perfom some action with module
   **/
  forEachMod(func){
    if (this.modules) {
      for (let t of Object.keys(this.modules)) {
        let mod = this.modules[t];
        if (mod) {
          func(t, mod, this);
        }
      }
    }
  }

  /**
   *  Importing modules from directory. Chainable.
   *  @param   {string}  modulesPath  path to container directory
   *  @return {object}        notDomain
   **/
  importModulesFrom(modulesPath) {
    fs.readdirSync(modulesPath).forEach((file) => {
      this.importModuleFrom(path.join(modulesPath, file), file);
    });
    return this;
  }

  /**
   *  Import single module from module dir. Chainable.
   *  @param  {string}  modulePath   path to module directory
   *  @param  {string}  moduleName  name under witch module will be registered
   *  @return {object}        notDomain
   */
  importModuleFrom(modulePath, moduleName) {
    let mod = new notModule({
      modPath: modulePath,
      modObject: null,
      mongoose: this.options.mongoose,
      notApp: this,
      fields: this.options.fields
    });
    this.importModule(mod, moduleName || mod.getModuleName());
    return this;
  }

  /**
   *  Import module object. Chainable.
   *  @param   {object}  mod      notModule instance
   *  @param  {string}  moduleName  name under witch module will be registered
   *  @return {object}        notDomain
   **/
  importModule(mod, moduleName) {
    this.modules[moduleName] = mod;
    return this;
  }

  /**
   *  Returns route
   *  @param   {string}  name   'moduleName//routeName//functionName' ('not-user//user//add')
   *  @return {function}      route
   **/
  getRoute(name) {
    if (name.indexOf('//') > 0) {
      let [moduleName, routeName, routeFunctionName] = name.split('//');
      if (this.modules && objHas(this.modules, moduleName)) {
        let route = this.modules[moduleName].getRoute(routeName);
        if (objHas(route, routeFunctionName)) {
          return route[routeFunctionName];
        }
      }
    }
    return null;
  }

  /**
   *  Returns form
   *  @param   {string}  name   'formName' or 'moduleName//formName'
   *                  ('login', 'not-user//login')
   *  @return {object}        form
   **/
  getForm(name) {
    const type = 'form';
    return this.getByPath(name, type);
  }

  /**
   *  Returns model
   *  @param   {string}  name   'modelName' or 'moduleName//modelName'
   *                  ('User', 'moduleName//User')
   *  @return {object}        model
   **/
  getModel(name) {
    const type = 'model';
    return this.getByPath(name, type);
  }

  getByFullPath(name, type){
    let [moduleName, resourceName] = name.split('//');
    if (this.modules && objHas(this.modules, moduleName)) {
      return this.modules[moduleName][`get${firstLetterToUpper(type)}`](resourceName);
    } else {
      return null;
    }
  }

  getByShortPath(resourceName, type){
    for (let moduleName of Object.keys(this.modules)) {
      const res = this.modules[moduleName][`get${firstLetterToUpper(type)}`](resourceName);
      if(res){
        return res;
      }
    }
    return null;
  }

  /**
   *  Returns file with model declarations
   *  @param {string}   name  'modelName' or 'moduleName//modelName'
   *  @return  {object}        CommonJS module object
   **/
  getModelFile(name) {
    const type = 'modelFile';
    return this.getByPath(name, type);
  }

  /**
   *  Returns specified by name or 'moduleName//modelName' model Schema
   *  @param {string} name  'modelName' or 'moduleName//modelName'
   *  @return {object}       model schema
   **/

  getModelSchema(name) {
    const type = 'modelSchema';
    return this.getByPath(name, type);
  }

  /**
   *  Returns logic
   *  @param   {string}  name   'logicName' or 'moduleName//logicName'
   *                  ('User', 'moduleName//User')
   *  @return {object}        logic
   **/
  getLogic(name) {
    const type = 'logic';
    return this.getByPath(name, type);
  }


  /**
   *  Returns file with logic declarations
   *  @param {string}   name  'logicName' or 'moduleName//logicName'
   *  @return  {object}        CommonJS module object
   **/
  getLogicFile(name) {
    const type = 'logicFile';
    return this.getByPath(name, type);
  }

  getByPath(name, type){
    if (name.indexOf('//') > 0) {
      return this.getByFullPath(name, type);
    } else {
      return this.getByShortPath(name, type);
    }
  }

  /**
   *  Return module by specified module name
   *  @param {string}  moduleName 'moduleName'
   *  @return {object}  module
   **/
  getModule(moduleName) {
    if (this.modules && objHas(this.modules,moduleName)) {
      return this.modules[moduleName];
    } else {
      for (let t in this.modules) {
        if (this.modules[t].getModuleName() === moduleName) {
          return this.modules[t];
        }
      }
      return null;
    }
  }

  /**
   *  Execute method in modules
   *  @param {string}  methodName  name of the method to execute
   **/
  async execInModules(methodName) {
    for (let mod of Object.values(this.modules)) {
      try{
        if(isFunc(mod.exec)){
          if(isAsync(mod.exec)){
            await mod.exec(methodName);
          }else{
            mod.exec(methodName);
          }
        }
      }catch(e){
        this.report(e);
      }
    }
  }

  /**
   *  Execute fabricateModels methods on all registered modules
   *  Create mongoose models.
   **/
  fabricate() {
    for (let mod of Object.values(this.modules)) {
      mod.fabricateModels && mod.fabricateModels();
    }
  }

  /**
   *  logger
   */
  set logger(logger) {
    this._logger = logger;
  }

  get logger() {
    if (typeof this._logger !== 'undefined' && this._logger !== null) {
      return this._logger;
    } else {
      return console;
    }
  }

  log() {
    this.logger.log(...arguments);
    return this;
  }

  /**
   *  reporter - errors
   */

  get DEFAULT_REPORTER() {
    return {
      async report(...params) {
        console.error(params);
      }
    };
  }

  set reporter(reporter) {
    this._reporter = reporter;
  }

  get reporter() {
    return this._reporter || this.DEFAULT_REPORTER;
  }

  report(err) {
    this.reporter.report(err).catch(this.logger.error);
  }

  /**
   *  informer - messages
   */
  get DEFAULT_INFORMER() {
    return {
      now: console.info
    };
  }

  set informer(informer /* not-informer.Informer */ ) {
    this._informer = informer;
  }

  get informer() {
    return this._informer || this.DEFAULT_INFORMER;
  }

  inform(data /* look for not-informer.Informer.now */ ) {
    this.informer.now(data);
  }

  addWSServer(name, wss) {
    this._wss[name] = wss;
  }

  WSServer(name = 'main') {
    if (objHas(this._wss, name)) {
      return this._wss[name];
    } else {
      return undefined;
    }
  }

  addWSClient(name, wsc) {
    this._wsc[name] = wsc;
  }

  WSClient(name) {
    if (objHas(this._wsc, name)) {
      return this._wsc[name];
    } else {
      return undefined;
    }
  }


  /**
  *
  * Logging message about shutdown.
  * Emits event app:shutdown
  * Exits from process after timeout
  * @param {number} timeout=OPT_DEFAULT_SHUTDOWN_TIMEOUT  time in ms before exit
  **/
  shutdown(timeout = OPT_DEFAULT_SHUTDOWN_TIMEOUT) {
    this.log(`Перезагрузка сервиса через ${timeout}мс...`);
    this.emit('app:shutdown');
    setTimeout(process.exit, timeout);
  }


  /**
  * Returns info about whole system.
  * Modules - total count, list, content
  * Routes - total count, list
  * Models - total count, list
  * Actions - total count, list
  * Roles - total count, list
  * @return {Object}  complex object with results
  **/
  getStatus() {
    const mods = Object.keys(this.modules);
    let stats = {
      modules: {
        count: mods.length,
        list: mods,
        content: {}
      },
      routes: {
        count: 0,
        list: []
      },
      models: {
        count: 0,
        list: []
      },
      forms: {
        count: 0,
        list: []
      },
      actions: {
        count: 0,
        list: []
      },
      roles: {
        count: 0,
        list: []
      },
    };
    for (let modName in this.modules) {
      const mod = this.modules[modName];
      let modStatus = mod.getStatus();
      stats.modules.content[modName] = modStatus;
      stats.routes.count += modStatus.routes.count;
      stats.models.count += modStatus.models.count;
      stats.forms.count += modStatus.forms.count;
      stats.actions.count += modStatus.actions.count;
      for (let t of ['routes', 'models', 'actions', 'forms']) {
        stats[t].list.push(...(modStatus[t].list.map(itmName => `${modName}//${itmName}`)));
      }
    }
    return stats;
  }

  getEnv(key) {
    return Env.getEnv(key);
  }

  /**
   *  Setting application environment variable
   *  @param   {string}      key  name of var
   *  @param   {object}      val  value
   *  @return {notDomain}      chainable
   */
  static setEnv(key, val) {
    Env.setEnv(key, val);
    return this;
  }

}

module.exports = notDomain;

/*
  new notDomain({
    mongoose: mongooseLink
    modulesCollectionPaths: [__dirname + '/modules'], //each path to folder with modules
    modulesPaths: [],  //each path to module
    modules: {
      filestore: require('not-filestore') //each npm not-* module with custom overriden name as key
    }
  }).importModuleFrom(__dirname+'/anotherModule', 'anotherCustomModuleName')  //import module from path
  .importModulesFrom(__dirname+'/directoryOfUsefullessModules')
  .importModule(require('notModule'), 'notModule');

  use as container for modules and models
*/

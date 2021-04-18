const notDomain = require('./domain');
const extend = require('extend');
const parent = require('../index.js');
const log = require('not-log')(module, 'notApp');

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
  constructor(options) {
    super(options);
    this.wsEndPoints = {};
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
      if (this.hasWSEndPoints()) {
        this.exposeWS();
      }
    }
  }

  collectWSEndPoints(mod) {
    let eps = mod.getEndPoints();
    if (eps) {
      for (let type in eps) {
        this.checkWSEndPointType(type);
        for (let name in eps[type]) {
          this.addWSAction(type, name, eps[type][name]);
        }
      }
    }
  }

  checkWSEndPointType(endPointType) {
    if (!Object.prototype.hasOwnProperty.call(this.wsEndPoints, endPointType)) {
      this.wsEndPoints[endPointType] = {};
    }
  }

  addWSAction(type, name, endPoint) {
    this.wsEndPoints[type][name] = endPoint;
  }

  hasWSEndPoints() {
    return Object.keys(this.wsEndPoints).length;
  }

  exposeWS() {
    //include only in case
    try {


    } catch (e) {
      log.error(e);
    }
  }

  initWSServer() {
    log.info('Starting WSServer...');
    try {
			const opts = this.getEnv('WS');
      if(!opts){
        throw new Error('No WS server options in notApp Environments: .getEnv("WS")');
      }
      const {
        notWSServer,
        notWSRouter,
        notWSMessenger
      } = require('not-ws');
      const secure = opts.secure;
			const types = this.getWSTypes();
      const validators = this.getWSValidators();
      const WSServer = new notWSServer({
        port: opts.port,
        getRouter() {
          return new notWSRouter({}, this.wsEndPoints);
        },
        getMessenger() {
          return new notWSMessenger({
            secure,
            types,
            validators
          });
        },
        secure: opts.secure,
        jwt: {
          key: opts.secret
        }
      });
      notApp.addWSServer('main', WSServer);
      WSServer.start();
      log.info('WS server listening on port ' + opts.port);
    } catch (e) {
      log.error('WS server startup failure');
      log.error(e);
    }
  }

  getWSValidators(){
    if(this.getEnv('WSValidators')){
      return this.getEnv('WSValidators');
    }else{
      const jwt = require('jsonwebtoken');
      const opts = this.getEnv('WS');
      return {
        credentials(credentials) {
          try {
            let data = jwt.verify(credentials, opts.secret);
            if (data && typeof data.active === 'boolean') {
              return data.active;
            } else {
              return false;
            }
          } catch (e) {
            log.error(e);
            return false;
          }
        }
      };
    }
  }

  getWSTypes(){
    if(this.getEnv('WSTypes')){
      return this.getEnv('WSTypes');
    }else{
      const types = {};
      for(let type in this.wsEndPoints){
        types[type] = Object.keys(this.wsEndPoints[type]);
      }
      return types;
    }
  }

}

module.exports = notApp;

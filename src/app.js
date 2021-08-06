const Auth = require('./auth/auth');
const notDomain = require('./domain');
const merge = require('deepmerge');
const parent = require('../index.js');

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
    parent.Application = this;
    parent.getModel = this.getModel.bind(this);
    parent.getLogic = this.getLogic.bind(this);
    parent.getRoute = this.getRoute.bind(this);
    parent.getModelFile = this.getModelFile.bind(this);
    parent.getModelSchema = this.getModelSchema.bind(this);
    parent.getLogicFile = this.getLogicFile.bind(this);
    parent.execInModules = this.execInModules.bind(this);
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
      manifest = merge(manifest, this.modules[modName].getManifest({
        auth: Auth.isUser(req),
        role: Auth.getRole(req),
        root: Auth.isRoot(req)
      }));
    }
    this.requiredManifests = manifest;
    return manifest;
  }

  /**
   *	Exposes routes to ExpressJS application
   *	@param {object} 	app	ExpressJS application instance
   **/
  expose(app) {
    this.forEachMod((modName, mod)=>{
      if (mod.expose) {
        mod.expose(app, modName);
      }
    });
  }

  getActionManifestForUser(model, action, user) {
    for (let modName of Object.keys(this.modules)) {
      const manifest = this.modules[modName].getManifest({
        auth: user.auth,
        role: user.role,
        root: user.root
      });
      if(Object.keys(manifest).indexOf(model) > -1){
        if(Object.prototype.hasOwnProperty.call(manifest[model], 'actions')){
          if(Object.prototype.hasOwnProperty.call(manifest[model].actions, action)){
            return manifest[model].actions[action];
          }
        }
      }
    }
    return false;
  }

}

module.exports = notApp;

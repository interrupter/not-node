const	notDomain = require('./domain');
const	extend = require('extend');
const	parent = require('../index.js');


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
class notApp extends notDomain{
	constructor(options){
		super(options);
		parent.Application = this;
		return this;
	}

	/**
	*	Returns application manifest
	*	@params		{object}	req 			Express request object
	*	@return 	{object}	manifest
	**/
	getManifest(req){
		let manifest = {};
		for(let modName of Object.keys(this.modules)){
			manifest = extend(manifest, this.modules[modName].getManifest(req));
		}
		this.requiredManifests = manifest;
		return manifest;
	}

	/**
	*	Exposes routes to ExpressJS application
	*	@param {object} 	app	ExpressJS application instance
	**/
	expose(app){
		if (this.modules){
			for(let t of Object.keys(this.modules)){
				this.modules[t] && this.modules[t].expose && this.modules[t].expose(app, t);
			}
		}
	}
}

module.exports = notApp;

const
	notDomain = require('./domain'),
	extend = require('extend'),
	path = require('path'),
	log = require('not-log')(module),
	fs = require('fs'),
	parent = require('../index.js');

/**
* Application
**/
class notApp extends notDomain{
	constructor(options){
		super(options);
		parent.Application = this;
		return this;
	}

	/**
	*	Returns application manifest
	*	@return 	{object}	manifest
	**/
	getManifest(){
		let manifest = {};
		for(let modName of Object.keys(this.modules)){
			manifest = extend(manifest, this.modules[modName].getManifest());
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

/*
	new notApp({
		mongoose: mongooseLink
		modulesCollectionPaths: [__dirname + '/modules'], //each path to folder with modules
		modulesPaths: [],	//each path to module
		modules: {
			filestore: require('not-filestore') //each npm not-* module with custom overriden name as key
		}
	}).importModuleFrom(__dirname+'/anotherModule', 'anotherCustomModuleName')	//import module from path
	.importModulesFrom(__dirname+'/directoryOfUsefullessModules')
	.importModule(require('notModule'), 'notModule')
	.expose(ExpressApp);

*/

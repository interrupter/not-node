const
	notDomain = require('./domain'),
	extend = require('extend'),
	path = require('path'),
	log = require('not-log')(module),
	fs = require('fs');

class notApp extends notDomain{
	constructor(options){
		super(options);
		return this;
	}

	getManifest(){
		let manifest = {};
		for(let modName of Object.keys(this.modules)){
			manifest = extend(manifest, this.modules[modName].getManifest());
		}
		this.requiredManifests = manifest;
		return manifest;
	}

	expose(app){
		if (this.modules){
			for(let t of Object.keys(this.modules)){
				this.modules[t] && this.modules[t].expose && this.modules[t].expose(app, t);
			}
		}
	}

	execInModules(methodName){
		for(let t in this.modules){
			let mod = this.modules[t];
			if (mod && typeof mod.exec === 'function'){
				mod.exec(methodName);
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

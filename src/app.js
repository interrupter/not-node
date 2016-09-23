var notModule = require('./manifest/module'),
	extend = require('extend'),
	path = require('path'),
	fs = require('fs');

class notApp{
	constructor(options){
		this.options = options;
		//named array of notModules wrappers for notModule format modules
		this.modules = {};
		return this;
	}

	importModulesFrom(modulesPath){
		fs.readdirSync(modulesPath).forEach(function(file) {
			this.importModuleFrom(path.join(modulesPath, file));
		}.bind(this));
		return this;
	}

	importModuleFrom(modulePath, moduleName){
		let mod = new notModule(modulePath);
		if (mod){
			this.registerModule(mod, moduleName || mod.description.name);
		}
		return this;
	}

	importModule(mod, moduleName){
		this.modules[moduleName] = mod;
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

/*
	modelName - 'User', 'moduleName//User'
*/
	getModel(modelName){
		let result = null;
		if (modelName.indexOf('//') > 0){
			let [moduleName, modelName] = modelName.split('//');
			if (this.modules && this.modules.hasOwnProperty(moduleName)){
				return this.modules.getModel(modelName);
			}else{
				return result;
			}
		}else{
			for(let t in Object.keys(this.modules)){
				let tmp = this.modules.getModel(modelName);
				if (tmp){
					if(!result) {result = [];}
					result.push(tmp);
				}
			}
		}
		return (result && result.length === 1)?result[0]:result;
	}

	expose(app){
		if (this.modules){
			for(let t in Object.keys(this.modules)){
				this.modules[t].expose(app);
			}
		}
	}
}

module.exports = notApp;

/*
	new notApp({
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

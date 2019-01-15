/**
*	Not an App,
*	But can be used for hosting modules and models.
*
*/

const notModule = require('./manifest/module'),
	path = require('path'),
	fs = require('fs');

/**
	*	Domain
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
	*	@example <caption>Domain creation routine</caption>
	*	let App = new new notDomain({
	*		mongoose: mongooseLink
	*		modulesCollectionPaths: [__dirname + '/modules'], //each path to folder with modules
	*		modulesPaths: [],	//each path to module
	*		modules: {
	*			filestore: require('not-filestore') //each npm not-* module with custom overriden name as key
	*		}
	*	})
	*		.importModuleFrom(__dirname+'/anotherModule', 'anotherCustomModuleName')	//import module from path
	*		.importModulesFrom(__dirname+'/directoryOfUsefullessModules')
	*		.importModule(require('notModule'), 'notModule');
	**/
class notDomain{
	constructor(options){
		this.options = options;
		//named array of notModules wrappers for notModule format modules
		this.modules = {};
		this._logger = null;
		this._reporter = null;
		//store
		this.envs = {};
		return this;
	}

	/**
	*	Importing modules from directory. Chainable.
	*	@param 	{string}	modulesPath	path to container directory
	*	@return {object}				notDomain
	**/
	importModulesFrom(modulesPath){
		fs.readdirSync(modulesPath).forEach(function(file) {
			this.importModuleFrom(path.join(modulesPath, file), file);
		}.bind(this));
		return this;
	}

	/**
	*	Import single module from module dir. Chainable.
	*	@param	{string}	modulePath 	path to module directory
	*	@param	{string}	moduleName	name under witch module will be registered
	*	@return {object}				notDomain
	*/
	importModuleFrom(modulePath, moduleName){
		let mod = new notModule({
			modPath:modulePath,
			modObject: null,
			mongoose: this.options.mongoose,
			notApp: this
		});
		if (mod){
			this.importModule(mod, moduleName || mod.getModuleName());
		}
		return this;
	}

	/**
	*	Import module object. Chainable.
	*	@param 	{object}	mod			notModule instance
	*	@param	{string}	moduleName	name under witch module will be registered
	*	@return {object}				notDomain
	**/
	importModule(mod, moduleName){
		this.modules[moduleName] = mod;
		return this;
	}

	/**
	*	Returns model
	*	@param 	{string}	name 	'modelName' or 'moduleName//modelName'
	*									('User', 'moduleName//User')
	*	@return {object}				model
	**/
	getModel(name){
		let result = null;
		if (name.indexOf('//') > 0){
			let [moduleName, modelName] = name.split('//');
			if (this.modules && this.modules.hasOwnProperty(moduleName)){
				return this.modules[moduleName].getModel(modelName);
			}else{
				return result;
			}
		}else{
			let mNames = Object.keys(this.modules);
			for(let t = 0; t < mNames.length; t++){
				if (!this.modules.hasOwnProperty(mNames[t])){
					continue;
				}
				let tmp = this.modules[mNames[t]].getModel(name);
				if (tmp){
					if(!result) {result = [];}
					result.push(tmp);
				}
			}
		}
		return (result && result.length === 1)?result[0]:result;
	}


	/**
	*	Returns file with model declarations
	*	@param {string} 	modelName	'modelName' or 'moduleName//modelName'
	*	@return	{object}				CommonJS module object
	**/
	getModelFile(modelName){
		let result = null;
		if (modelName.indexOf('//') > 0){
			let [moduleName, modelName] = modelName.split('//');
			if (this.modules && this.modules.hasOwnProperty(moduleName)){
				return this.modules.getModelFile(modelName);
			}else{
				return result;
			}
		}else{
			let mNames = Object.keys(this.modules);
			for(let t = 0; t < mNames.length; t++){
				if (!this.modules.hasOwnProperty(mNames[t])){
					continue;
				}
				let tmp = this.modules[mNames[t]].getModelFile(modelName);
				if (tmp){
					if(!result) {result = [];}
					result.push(tmp);
				}
			}
		}
		return (result && result.length === 1)?result[0]:result;
	}


	/**
	*	Returns specified by name or 'moduleName//modelName' model Schema
	*	@param {string} modelName	'modelName' or 'moduleName//modelName'
	*	@return {object} 			model schema
	**/

	getModelSchema(modelName){
		let result = null;
		if (modelName.indexOf('//') > 0){
			let [moduleName, modelName] = modelName.split('//');
			if (this.modules && this.modules.hasOwnProperty(moduleName)){
				return this.modules.getModelSchema(modelName);
			}else{
				return result;
			}
		}else{
			let mNames = Object.keys(this.modules);
			for(let t = 0; t < mNames.length; t++){
				if (!this.modules.hasOwnProperty(mNames[t])){
					continue;
				}
				let tmp = this.modules[mNames[t]].getModelSchema(modelName);
				if (tmp){
					if(!result) {result = [];}
					result.push(tmp);
				}
			}
		}
		return (result && result.length === 1)?result[0]:result;
	}


	/**
	*	Return mixins for model
	*	@param {string}	modelNamespecified by 'moduleName//modelName' or 'modelName'
	*	@return	{array}	of mixins
	*/
	getModelMixins(modelName){
		let result = [],
			mNames = Object.keys(this.modules);
		for(let modName of mNames){
			let mod = this.modules[modName];
			if (!mod){
				continue;
			}
			let tmp = mod.getMixin(modelName);
			if (tmp){
				result.push(tmp);
			}
		}
		return result;
	}

	/**
	*	Return module by specified module name
	*	@param {string}	moduleName 'moduleName'
	*	@return {object}	module
	**/
	getModule(moduleName){
		if (this.modules && this.modules.hasOwnProperty(moduleName)){
			return this.modules[moduleName];
		}else{
			for(let t in this.modules){
				if(this.modules[t].getModuleName() === moduleName){
					return this.modules[t];
				}
			}
			return null;
		}
	}

	/**
	*	Execute method in modules
	*	@param {string}	methodName	name of the method to execute
	**/
	execInModules(methodName){
		for(let t in this.modules){
			let mod = this.modules[t];
			if (mod && typeof mod.exec === 'function'){
				mod.exec(methodName);
			}
		}
	}

	/**
	*	Execute fabricateModels methods on all registered modules
	*	Create mongoose models.
	**/
	fabricate(){
		if (this.modules){
			for(let t of Object.keys(this.modules)){
				this.modules[t] && this.modules[t].expose && this.modules[t].fabricateModels();
			}
		}
	}

	/**
	*	Returns application environment variable
	*	@param 	{string}			key	name of var
	*	@return {object|undefined}		value or undefined
	*/
	getEnv(key){
		if(this.envs.hasOwnProperty(key)){
			return this.envs[key];
		}else{
			return	undefined;
		}
	}

	/**
	*	Setting application environment variable
	*	@param 	{string}			key	name of var
	*	@param 	{object}			val	value
	*	@return {notDomain}			chainable
	*/
	setEnv(key, val){
		this.envs[key] = val;
		return this;
	}

	/**
	*	logger
	*/
	set logger(logger){
		this._logger = logger;
	}

	get logger(){
		return this._logger || console;
	}

	/**
	*	reporter
	*/
	set reporter(reporter){
		this._reporter = reporter;
	}

	get reporter(){
		return this._reporter || console.error;
	}

	report(err){
		this.reporter.report(err);
	}

}

module.exports = notDomain;

/*
	new notDomain({
		mongoose: mongooseLink
		modulesCollectionPaths: [__dirname + '/modules'], //each path to folder with modules
		modulesPaths: [],	//each path to module
		modules: {
			filestore: require('not-filestore') //each npm not-* module with custom overriden name as key
		}
	}).importModuleFrom(__dirname+'/anotherModule', 'anotherCustomModuleName')	//import module from path
	.importModulesFrom(__dirname+'/directoryOfUsefullessModules')
	.importModule(require('notModule'), 'notModule');

	use as container for modules and models
*/

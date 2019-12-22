//importing modules
const protoModel = require('../model/proto.js'),
	fs = require('fs'),
	path = require('path'),
	notLocale = require('not-locale'),
	log = require('not-log')(module),
	notManifest = require('./manifest.js');

//defining CONSTS
const DEFAULT_MANIFEST_FILE_ENDING = '.manifest.js';
/**
*	Module representation
*	@class
*	@param	{object} 	options			options
**/
class notModule {
	constructor(options) {
		log.info(`Creating module: ${options.modPath}`);
		this.path = options.modPath;
		this.module = options.modObject;
		this.mongoose = options.mongoose;
		this.notApp = options.notApp;
		this.description = {};
		this.routes = {};
		this.models = {};
		this.mixins = {};
		this.manifests = {};
		this.faulty = false;
		this.paths = {
			routes: {},
			models: {}
		};
		this.init();
		return this;
	}

	getModuleName(){
		return this.description.name || this.module.name || this.path;
	}

	map(to, list){
		for(let item of list){
			if(typeof this[item] === 'function'){
				to[item] = this[item].bind(this.notApp);
			}
		}
	}

	init() {
		if (this.path) {
			this.initFromPath(this.path);
		} else if (this.module) {
			this.initFromModule(this.module);
		}
		if(this.module === null || typeof this.module === 'undefined'){
			log.error(`Module ${this.path} not loaded`);
		}else{
			this.map(this.module, [
				'getModel',
				'getModelSchema',
				'getModelFile'
			]);
		}
	}

	initFromPath(modulePath) {
		try {
			if (fs.lstatSync(modulePath).isDirectory()) {
				this.module = require(modulePath);
				this.registerContent();
			}
		} catch (e) {
			this.faulty = true;
			// eslint-disable-next-line no-console
			console.error(e);
		}
	}

	initFromModule() {
		try {
			this.registerContent();
		} catch (e) {
			this.faulty = true;
			// eslint-disable-next-line no-console
			console.error(e);
		}
	}

	registerContent() {
		if (this.module.paths){
			if (this.module.paths.models) {
				this.findModelsIn(this.module.paths.models);
			}
			if (this.module.paths.mixins) {
				this.findMixinsIn(this.module.paths.mixins);
			}
			if (this.module.paths.routes) {
				this.findRoutesIn(this.module.paths.routes);
			}
			if (this.module.paths.locales) {
				notLocale.fromDir(this.module.paths.locales);
			}
			/*
			if (this.module.paths.controllers) {

			}
			if (this.module.paths.views) {

			}*/
		}
	}

	findModelsIn(modelsPath) {
		fs.readdirSync(modelsPath).forEach(function(file) {
			let modelPath = path.join(modelsPath, file);
			log.info(`Checking model in ${modelPath}`);
			if (fs.lstatSync(modelPath).isFile()) {
				let model = require(modelPath),
					modelName = file;
				if (model && model.thisModelName) {
					modelName = model.thisModelName;
				}
				this.registerModel(model, modelName);
			}
		}.bind(this));
	}

	findMixinsIn(mixinsPath) {
		fs.readdirSync(mixinsPath).forEach(function(file) {
			let mixinPath = path.join(mixinsPath, file);
			if (fs.lstatSync(mixinPath).isFile()) {
				let mixin = require(mixinPath),
					modelName = file;
				if (mixin && mixin.modelName) {
					modelName = mixin.modelName;
				}
				this.registerMixin(mixin, modelName);
			}
		}.bind(this));
	}

	findRoutesIn(routesPath) {
		fs.readdirSync(routesPath).forEach(function(file) {
			//если имя похоже на название манифеста
			if (file.indexOf(DEFAULT_MANIFEST_FILE_ENDING) > -1) {
				let routeBasename = file.substr(0, file.indexOf(DEFAULT_MANIFEST_FILE_ENDING)),
					routePath = path.join(routesPath, routeBasename + '.js'),
					routeManifestPath = path.join(routesPath, file);
				//проверяем есть ли файл роутов и манифеста
				if (fs.lstatSync(routePath).isFile() && fs.lstatSync(routeManifestPath).isFile()) {
					try{
						let route = require(routePath),
							routeManifest = require(routeManifestPath),
							routeName = routeBasename;
						if (route && route.thisRouteName) {
							routeName = route.thisRouteName;
						}
						this.registerRoute(route, routeName);
						this.registerManifest(routeManifest, routeName);
					}catch(e){
						log.error(e);
					}
				}
			}

		}.bind(this));
	}

	registerModel(model, modelName) {
		if(this.notApp){
			log.debug(`Register model ${modelName}`);
			model.getModel = this.notApp.getModel.bind(this.notApp);
			model.getModelFile = this.notApp.getModelFile.bind(this.notApp);
			model.getModelSchema = this.notApp.getModelSchema.bind(this.notApp);
			model.getModule = this.notApp.getModule.bind(this.notApp);
		}else{
			log.debug(`Register model ${modelName} skiped, no Application`);
		}
		model.getThisModule = () => this;
		this.models[modelName] = model;
	}

	registerMixin(mixin, modelName) {
		this.mixins[modelName] = mixin;
	}

	registerRoute(route, routeName) {
		this.routes[routeName] = route;
		if(this.notApp){
			log.debug(`Register route ${routeName}`);
			route.getModel = this.notApp.getModel.bind(this.notApp);
			route.getModelFile = this.notApp.getModelFile.bind(this.notApp);
			route.getModelSchema = this.notApp.getModelSchema.bind(this.notApp);
			route.getModule = this.notApp.getModule.bind(this.notApp);
		}else{
			log.debug(`Register route ${routeName} skiped, no Application`);
		}
		route.getThisModule = () => this;
	}

	registerManifest(manifest, routeName) {
		this.manifests[routeName] = manifest;
	}

	getManifest() {
		return this.manifests;
	}

	getModelFile(modelName) {
		if (this.models && Object.prototype.hasOwnProperty.call(this.models,modelName)) {
			return this.models[modelName];
		}else{
			return null;
		}
	}

	getModel(modelName) {
		try{
			let modelFile = this.getModelFile(modelName);
			if (modelFile && (modelName in modelFile)) {
				return modelFile[modelName];
			}else{
				return null;
			}
		}catch(e){
			log.error(e);
		}
	}

	getModelSchema(modelName) {
		let modelFile = this.getModelFile(modelName);
		if (modelFile && Object.prototype.hasOwnProperty.call(modelFile,modelName) && modelFile.thisSchema) {
			return modelFile.thisSchema;
		}
		return null;
	}

	getMixin(modelName) {
		if (this.mixins && Object.prototype.hasOwnProperty.call(this.mixins, modelName)) {
			return this.mixins[modelName];
		} else {
			return null;
		}
	}

	getRoute(routeName) {
		if (this.routes && Object.prototype.hasOwnProperty.call(this.routes, routeName)) {
			return this.routes[routeName];
		} else {
			return null;
		}
	}

	fabricateModel(model, mixins){
		if (mixins && Array.isArray(mixins) && mixins.length){
			for(let mixin of mixins){
				if (model.thisSchema && mixin.schema){
					model.thisSchema = Object.assign(model.thisSchema, mixin.schema);
				}
				if (model.thisMethods && mixin.methods){
					model.thisMethods = Object.assign(model.thisMethods, mixin.methods);
				}
				if (model.thisStatics && mixin.statics){
					model.thisStatics = Object.assign(model.thisStatics, mixin.statics);
				}
				if (model.thisVirtuals && mixin.virtuals){
					model.thisVirtuals = Object.assign(model.thisVirtuals, mixin.virtuals);
				}
			}
		}
		protoModel.fabricate(model, {}, this.mongoose);
	}

	fabricateModels(){
		for(let modelName in this.models){
			log.info(`Fabricating model: ${modelName}`);
			let modelMixins = [];
			if(this.notApp){
				modelMixins = this.notApp.getModelMixins(modelName);
			}
			this.fabricateModel(this.models[modelName], modelMixins);
		}
	}

	expose(app, moduleName) {
		if (this.manifests && app) {
			this.fabricateModels();
			this.manifest = new notManifest(app, this.notApp, moduleName);
			this.manifest.registerRoutes(this.manifests);
		}
	}

	exec(methodName){
		if(this.module){
			if(Object.prototype.hasOwnProperty.call(this.module, methodName)){
				if (typeof this.module[methodName] === 'function') {
					try{
						this.module[methodName](this.notApp);
					}catch(e){
						log.error(e);
					}
				}
			}
		}else{
			log.error(`Cant exec ${methodName} in module ${this.path}, module not loaded`);
		}
	}
}

module.exports = notModule;

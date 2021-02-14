//importing modules
const protoModel = require('../model/proto.js'),
	fs = require('fs'),
	path = require('path'),
	Auth = require('../auth/auth.js'),
	Fields = require('../fields.js'),
	notLocale = require('not-locale'),
	logger = require('not-log'),
	log = logger(module, 'notModule'),
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
		this.fieldsImportRules = (Object.prototype.hasOwnProperty.call(options, 'fields') && options.fields )?options.fields: {};
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
			log.error(e);
		}
	}

	initFromModule() {
		try {
			this.registerContent();
		} catch (e) {
			this.faulty = true;
			log.error(e);
		}
	}

	registerContent() {
		if (this.module.paths){
			if (this.module.paths.fields) {
				this.findFieldsIn(this.module.paths.fields);
			}
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
		}
	}

	findModelsIn(modelsPath) {
		fs.readdirSync(modelsPath).forEach((file) => {
			let modelPath = path.join(modelsPath, file);
			log.info(`Checking model in ${modelPath}`);
			if (fs.lstatSync(modelPath).isFile()) {
				let model = require(modelPath),
					modelName = file;
				if (model && model.thisModelName) {
					modelName = model.thisModelName;
				}
				model.filename = modelPath;
				this.registerModel(model, modelName);
			}
		});
	}

	findMixinsIn(mixinsPath) {
		fs.readdirSync(mixinsPath).forEach((file) =>{
			let mixinPath = path.join(mixinsPath, file);
			if (fs.lstatSync(mixinPath).isFile()) {
				let mixin = require(mixinPath),
					modelName = file;
				if (mixin && mixin.modelName) {
					modelName = mixin.modelName;
				}
				mixin.filename = mixinPath;
				this.registerMixin(mixin, modelName);
			}
		});
	}

	findFieldsIn(fieldsDir) {
		fs.readdirSync(fieldsDir).forEach((file) => {
			let fieldsPath = path.join(fieldsDir, file);
			if (fs.lstatSync(fieldsPath).isFile()) {
				let fields = require(fieldsPath);
				if (fields && Object.prototype.hasOwnProperty.call(fields, 'FIELDS')) {
					Fields.registerFields(fields.FIELDS, this.fieldsImportRules);
				}else{
					let parts = path.parse(fieldsPath);
					Fields.registerField(parts.name, fields, this.fieldsImportRules);
				}
			}
		});
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
						route.filename = routePath;
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
			model.log = logger(model, `Model#${modelName}`);
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
			route.log = logger(route, `Route#${routeName}`);
		}else{
			log.debug(`Register route ${routeName} skiped, no Application`);
		}
		route.getThisModule = () => this;
	}

	registerManifest(manifest, routeName) {
		this.manifests[routeName] = manifest;
	}

	getManifest(req) {
		if (req){
			let user = {
				auth: Auth.ifUser(req),
				role: Auth.getRole(req),
				admin: Auth.ifAdmin(req),
			};
			let filtered = this.manifest.filterManifest(
				this.manifests,
				user.auth,
				user.role,
				user.admin
			);
			return filtered;
		}else{
			return this.manifests;
		}
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

	getStatus(){
		const modelsList = Object.keys(this.models);
		const routesList = Object.keys(this.routes);
		const actionsList = this.getActionsList();
		let status = {
			models:{
				count: modelsList.length,
				list: modelsList
			},
			routes:{
				count: routesList.length,
				list: routesList,
				content: this.getRoutesStatuses()
			},
			actions:{
				count: actionsList.length,
				list: actionsList
			}
		};
		return status;
	}

	getActionsList(){
		let list = [];
		for(let route in this.manifests){
			if (this.manifests[route] && this.manifests[route].actions){
				for(let action in this.manifests[route].actions){
					list.push(`${route}//${action}`);
				}
			}
		}
		return list;
	}

	getRoutesStatuses(){
		let result = {};
		for(let route in this.manifests){
			let count = 0, actions = [];
			if (this.manifests[route] && this.manifests[route].actions){
				count = this.manifests[route].actions.count;
				for(let action in this.manifests[route].actions){
					actions.push(`${action}`);
				}
			}
			result[route] = {
				count,
				actions
			};
		}
		return result;
	}

}

module.exports = notModule;

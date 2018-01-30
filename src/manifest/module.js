//importing modules
const protoModel = require('../model/proto.js'),
	fs = require('fs'),
	path = require('path'),
	notLocale = require('not-locale'),
	notManifest = require('./manifest.js');

//defining CONSTS
const DEFAULT_MANIFEST_FILE_ENDING = '.manifest.js';

class notModule {
	constructor(options) {
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

	init() {
		if (this.path) {
			this.initFromPath(this.path);
		} else if (this.module) {
			this.initFromModule(this.module);
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
		}
	}

	initFromModule() {
		try {
			this.registerContent();
		} catch (e) {
			this.faulty = true;
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
					let route = require(routePath),
						routeManifest = require(routeManifestPath),
						routeName = routeBasename;
					if (route && route.thisRouteName) {
						routeName = route.thisRouteName;
					}
					this.registerRoute(route, routeName);
					this.registerManifest(routeManifest, routeName);
				}
			}

		}.bind(this));
	}

	registerModel(model, modelName) {
		model.getModel = this.notApp.getModel.bind(this.notApp);
		this.models[modelName] = model;
	}

	registerMixin(mixin, modelName) {
		this.mixins[modelName] = mixin;
	}

	registerRoute(route, routeName) {
		this.routes[routeName] = route;
		route.getModel = this.notApp.getModel.bind(this.notApp);
	}

	registerManifest(manifest, routeName) {
		this.manifests[routeName] = manifest;
	}

	getManifest() {
		return this.manifests;
	}

	getModel(modelName) {
		if (this.models && this.models.hasOwnProperty(modelName)) {
			return this.models[modelName];
		} else {
			return null;
		}
	}

	getMixin(modelName) {
		if (this.mixins && this.mixins.hasOwnProperty(modelName)) {
			return this.mixins[modelName];
		} else {
			return null;
		}
	}

	getRoute(routeName) {
		if (this.routes && this.routes.hasOwnProperty(routeName)) {
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
			let modelMixins = this.notApp.getModelMixins(modelName);
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
}

module.exports = notModule;

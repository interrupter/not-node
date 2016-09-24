//importing modules
const protoModel = require('../model/proto.js'),
	fs = require('fs'),
	path = require('path'),
	notManifest = require('./manifest.js');
//defining CONSTS
const DEFAULT_MANIFEST_FILE_ENDING = '.manifest.js';

class notModule {
	constructor(options) {
		this.path = options.modPath;
		this.module = options.modObject;
		this.mongoose = options.mongoose;
		this.description = {};
		this.routes = {};
		this.models = {};
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
			console.log(e);
			this.faulty = true;
		}
	}

	initFromModule() {
		try {
			this.registerContent();
		} catch (e) {
			console.log(Object.keys(this));
			console.log(e);
			this.faulty = true;
		}
	}

	registerContent() {
		if (this.module.paths){
			if (this.module.paths.models) {
				this.findModelsIn(this.module.paths.models);
			}
			if (this.module.paths.routes) {
				this.findRoutesIn(this.module.paths.routes);
			}
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
		protoModel.fabricate(model, {}, this.mongoose);
		this.models[modelName] = model;
	}

	registerRoute(route, routeName) {
		this.routes[routeName] = route;
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

	getRoute(routeName) {
		if (this.routes && this.routes.hasOwnProperty(routeName)) {
			return this.routes[routeName];
		} else {
			return null;
		}
	}

	expose(app) {
		if (this.manifests && app) {
			this.manifest = new notManifest(app);
			for (let t of Object.keys(this.manifests)) {
				this.manifest.registerRoutes(this.manifests[t]);
			}
		}
	}

}

module.exports = notModule;

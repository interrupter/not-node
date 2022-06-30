const Auth = require("./auth");
const notDomain = require("./domain");
const merge = require("deepmerge");
const parent = require("../index.js");
const { objHas } = require("./common");

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
     *	Returns application manifest, by ExpressRequest
     *	@params		{object}	req 			Express request object
     *	@return 	{object}	manifest
     **/
    getManifest(req) {
        const creds = Auth.extractAuthData(req);
        return this.collectManifest(creds);
    }

    /**
     *	Returns application manifest, by user credentials object
     *	@params		{object}	creds 		not-node Auth.extractAuthData result
     *	@return 	{object}	manifest
     **/
    collectManifest(creds) {
        let manifest = {};
        for (let modName of this.getModulesNames()) {
            manifest = merge(
                manifest,
                this.getModule(modName).getManifest(creds)
            );
        }
        return manifest;
    }

    /**
     *	Exposes routes to ExpressJS application
     *	@param {object} 	app	ExpressJS application instance
     **/
    expose(app) {
        this.forEachMod((modName, mod) => {
            if (typeof mod.expose === "function") {
                mod.expose(app, modName);
            }
        });
    }

    getActionManifestForUser(model, action, user) {
        const manifest = this.collectManifest(user);
        if (
            Object.keys(manifest).includes(model) &&
            objHas(manifest[model], "actions") &&
            objHas(manifest[model].actions, action)
        ) {
            return manifest[model].actions[action];
        }
        return false;
    }
}

module.exports = notApp;

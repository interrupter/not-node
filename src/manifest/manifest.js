var Auth = require('../auth/auth'),
	Parser = require('../parser'),
	RouterAction = require('./routerAction'),
	extend = require('extend'),
	fs = require('fs');

/*

	Loaded route files.
	routeName => routeModule

*/

exports.requiredRoutes = {};

/*

	Loaded route manifest files.
	routeName => routeManifest

*/

exports.requiredManifests = {};

/*

	Loaded route files from outside routesPath.
	routeName => {
		(object)manifest,
		(module)route
	}

*/

exports.routesPaths = {};

exports.registerRoutesPath = function(name, routesPath){
	this.routesPaths[name] = routesPath;
};

exports.clearRoutesPaths = function(){
	this.routesPaths = {};
};

exports.DEFAULT_MANIFEST_FILE_ENDING = '.manifest.js';


/*

	Clear action definition from rules of access

*/

exports.clearActionFromRules = function(action){
	delete action.rules;
	delete action.admin;
	delete action.auth;
	delete action.role;
	delete action.actionName;
	delete action.actionPrefix;
	return action;
};

/*

	Clear route from action variants that not permited for user according to
	his auth, role, admin status

	(object)route - route object
	(boolean)auth - user auth status
	(boolean)role - user role status
	(boolean)admin - user admin status

	Return router with only actions user can access with current states of auth, role, admin.
	With removed definitions of what rules of access are.

*/

exports.filterManifestRoute = function(route, auth, role, admin){
	var result = extend({}, route);
	result.actions = {};
	if (route && route.actions){
		for(var actionName in route.actions){
			var actionSet = route.actions[actionName];
			if (actionSet){
				if(actionSet.rules && actionSet.rules.length > 0){
					for(var i = 0; i < actionSet.rules.length; i++){
						if (Auth.checkCredentials(actionSet.rules[i], auth, role, admin)){
							result.actions[actionName] = this.clearActionFromRules(extend({}, actionSet));
							break;
						}
					}
				}else{
					if (Auth.checkCredentials(actionSet, auth, role, admin)){
						result.actions[actionName] = this.clearActionFromRules(extend({}, actionSet));
					}
				}
			}
		}
	}
	return result;
};

/*

	Filters manifest for current user auth, role, admin.
	Removes all actions that can not be performed

	(object)manifest - full raw manifest
	(boolean)auth - user auth status
	(boolean)role - user role status
	(boolean)admin - user admin status


*/

exports.filterManifest = function(manifest, auth, role, admin){
	var result = {};
	for(var routeName in manifest){
		let routeMan = this.filterManifestRoute(manifest[routeName], auth, role, admin);
		if(Object.keys(routeMan.actions).length > 0){
			result[routeName] = routeMan;
		}
	}
	return result;
};

/**
 *  Collect all existing manifests from files in the routes directory
 *  return object(extensionless routes collection file name : manifest)
 */

exports.getModuleManifest = function(moduleRoutes) {
	//console.warn('Looking for manifest files in '+ moduleRoutes);
	let manifest = {},
		that = this;
	fs.readdirSync(moduleRoutes).forEach(function(file) {
		if (file.indexOf(that.DEFAULT_MANIFEST_FILE_ENDING) > -1){
			let routeBasename = file.substr(0, file.indexOf(that.DEFAULT_MANIFEST_FILE_ENDING));
			let route = require(moduleRoutes + '/' + routeBasename + '.js'),
				routeManifest = require(moduleRoutes + '/' + file);
			if(routeManifest && routeManifest !== null && route && route !== null) {
				if (manifest.hasOwnProperty(routeBasename)){
					//console.error('Router('+routeBasename+') manifest already exists.');
				}else{
					manifest[routeBasename] = routeManifest;
					that.requiredRoutes[routeBasename] = route;
				}
			}
		}else{
			return;
		}
	});
	return manifest;
};

exports.getManifest = function(){
	let manifest = {};
	for(let moduleName in this.routesPaths){
		let moduleManifest = this.getModuleManifest(this.routesPaths[moduleName]);
		manifest = extend(manifest, moduleManifest);
	}
	this.requiredManifests = manifest;
	return manifest;
};

/**
 *  Создаем путь для одной конечной точки
 *
 *  app		 -   express app object
 *  routesPath  -   directory where routes files is placed
 *  routeLine   -   aka '/login', '/user/:id', etc
 *  modelName   -   name of the mongoose model, should be exact as file name with routes for this model. If /models/theme.js contains 'Theme' mongoose model, then /routes/theme.js should  `
 *				  contain routes for that model.
 *  actionSetName  -   name of action in routes file. Look for existing route file for understanding
 *  actionData  -
 *
 */


exports.registerRouteForAction = function(app, routeLine, modelName, actionName, actionData) {
	if(actionData && actionData.method){
		const routerAction =  new RouterAction(modelName, actionName, actionData);
		app[actionData.method.toLowerCase()](routeLine, routerAction.exec.bind(routerAction));
		return true;
	}else{
		return false;
	}
};

/**
 *  Создаем пути согласно манифесту
 *
 *  app - express app object
 *  routesPath - directory where routes files is placed
 *
 */

exports.registerRoutes = function(app, interfaceManifests) {
	let manModuleName = null,
		results = true,
		manModuleActionName,
		actionData,
		routeLine;
	for(manModuleName in interfaceManifests) {
		for(manModuleActionName in interfaceManifests[manModuleName].actions) {
			actionData = interfaceManifests[manModuleName].actions[manModuleActionName];
			if (interfaceManifests[manModuleName].url){
				routeLine = Parser.getRouteLine(interfaceManifests[manModuleName].url, manModuleName, manModuleActionName, actionData);
				let result = this.registerRouteForAction(app, routeLine, manModuleName, manModuleActionName, actionData);
				results = results && result;
			}
		}
	}
	return results;
};

exports.init = function(path){
	this.clearRoutesPaths();
	this.registerRoutesPath('', path);
};

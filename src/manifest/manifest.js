var Auth = require('../auth/auth'),
	Parser = require('../parser'),
	Route = require('./route'),
	extend = require('extend');

class notManifest{
	constructor(app, notApp){
		this.app = app;
		this.notApp = notApp;
		return this;
	}
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

	registerRouteForAction(routeLine, routeName, actionName, actionData) {
		if(actionData && actionData.method){
			const routerAction =  new Route(this.notApp, routeName, actionName, actionData);
			this.app[actionData.method.toLowerCase()](routeLine, routerAction.exec.bind(routerAction));
			return true;
		}else{
			return false;
		}
	}

	/**
	 *  Создаем пути согласно манифесту
	 *
	 *  app - express app object
	 *  routesPath - directory where routes files is placed
	 *
	 */

	registerRoutes(moduleManifest) {
		let actionData,
			routeLine;
		for(let route of Object.keys(moduleManifest)){
			if (moduleManifest[route].hasOwnProperty('actions') && moduleManifest[route].hasOwnProperty('url')){
				for(let action of Object.keys(moduleManifest[route].actions)){
					actionData = moduleManifest[route].actions[action];
					routeLine = Parser.getRouteLine(moduleManifest[route].url, route, action, actionData);
					this.registerRouteForAction(routeLine, route, action, actionData);
				}
			}
		}
	}

	/*

		Clear action definition from rules of access

	*/

	clearActionFromRules(action){
		delete action.rules;
		delete action.admin;
		delete action.auth;
		delete action.role;
		delete action.actionName;
		delete action.actionPrefix;
		return action;
	}

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

	filterManifestRoute(route, auth, role, admin){
		var result = extend({}, route);
		result.actions = {};
		if (route && route.actions){
			for(let actionName in route.actions){
				var actionSet = route.actions[actionName];
				if (actionSet){
					if(actionSet.rules && actionSet.rules.length > 0){
						for(let i = 0; i < actionSet.rules.length; i++){
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
	}

	/*

		Filters manifest for current user auth, role, admin.
		Removes all actions that can not be performed

		(object)manifest - full raw manifest
		(boolean)auth - user auth status
		(boolean)role - user role status
		(boolean)admin - user admin status


	*/

	filterManifest(manifest, auth, role, admin){
		var result = {};
		for(let routeName in manifest){
			let routeMan = this.filterManifestRoute(manifest[routeName], auth, role, admin);
			if(Object.keys(routeMan.actions).length > 0){
				result[routeName] = routeMan;
			}
		}
		return result;
	}

}

module.exports = notManifest;

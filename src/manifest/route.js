const CONST_BEFORE_ACTION = 'before',
	CONST_AFTER_ACTION = 'after';

const Auth = require('../auth/auth.js'),
	HttpError = require('../error').Http;

class notRoute{
	constructor(notApp, moduleName, routeName, actionName, actionData){
		this.notApp = notApp;
		this.routeName = routeName;
		this.moduleName = moduleName;
		this.actionName = actionName;
		this.actionData = actionData;
		return this;
	}

	selectRule(req){
		if (this.actionData){
			if(this.actionData.rules && this.actionData.rules.length > 0){
				for(var i = 0; i < this.actionData.rules.length; i++){
					if (Auth.checkCredentials(this.actionData.rules[i], Auth.ifUser(req), Auth.getRole(req), Auth.ifAdmin(req))){
						return this.actionData.rules[i];
					}
				}
			}else{
				if (Auth.checkCredentials(this.actionData, Auth.ifUser(req), Auth.getRole(req), Auth.ifAdmin(req))){
					return this.actionData;
				}
			}
		}
		return null;
	}

	exec(req, res, next){
		let rule = this.selectRule(req);
		if (rule){
			let actionName = this.actionName;
			if (rule.actionPrefix){
				actionName = rule.actionPrefix + actionName;
			}else{
				if(rule.actionName){
					actionName = rule.actionName;
				}else{
					if(rule.admin){
						actionName = '_' + actionName;
					}
				}
			}
			let mod = this.notApp.getModule(this.moduleName);
			if (mod){
				let modRoute = mod.getRoute(this.routeName);
				if (modRoute && modRoute.hasOwnProperty(actionName) && typeof modRoute[actionName] === 'function'){
					if (modRoute.hasOwnProperty(CONST_BEFORE_ACTION)){
						modRoute[CONST_BEFORE_ACTION](req, res, next);
					}
					let result = modRoute[actionName](req, res, next);
					if (modRoute.hasOwnProperty(CONST_AFTER_ACTION)){
						return modRoute[CONST_AFTER_ACTION](req, res, next);
					}else{
						return result;
					}
				}else{
					return null;
				}
			}else{
				return null;
			}
		}else{
			return next(new HttpError(403, 'rule for router not found'));
		}
	}
}

module.exports = notRoute;


const	CONST_BEFORE_ACTION = 'before';

const	CONST_AFTER_ACTION = 'after';

const Auth = require('../auth/auth.js'),
	log = require('not-log')(module, 'not-node'),
	HttpError = require('../error').Http;

/**
*	Route representation
*	@class
*	@param	{object}	notApp		notApplication instance
*	@param	{string}	moduleName	name of owner module
*	@param	{string}	routeName	route name
*	@param	{string}	actionName	action name
*	@param	{object}	actionData	action data
**/
class notRoute{
	constructor(notApp, moduleName, routeName, actionName, actionData){
		this.notApp = notApp;
		this.routeName = routeName;
		this.moduleName = moduleName;
		this.actionName = actionName;
		this.actionData = actionData;
		return this;
	}

	/**
	*	Select rule from available or return null
	*	@param	{object}	req 	Express Request Object
	*	@return	{object}	rule or null
	*/
	selectRule(req){
		if (this.actionData){
			if(this.actionData.rules && this.actionData.rules.length > 0){
				for(var i = 0; i < this.actionData.rules.length; i++){
					if (Object.prototype.hasOwnProperty.call(this.actionData.rules[i], 'user')){
						log.error('Missformed rule, field "user" is not allowed, use "auth" instead: '+req.originalUrl);
					}
					if (Object.prototype.hasOwnProperty.call(this.actionData.rules[i], 'admin')){
						log.error('Missformed rule, field "admin" is obsolete, use "root" instead: '+req.originalUrl);
					}
					if (Auth.checkCredentials(this.actionData.rules[i], Auth.isUser(req), Auth.getRole(req), Auth.isRoot(req))){
						return this.actionData.rules[i];
					}
				}
			}else{
				if (Object.prototype.hasOwnProperty.call(this.actionData, 'user')){
					log.error('Missformed rule, field "user" is not allowed, use "auth" instead: '+req.originalUrl);
				}
				if (Object.prototype.hasOwnProperty.call(this.actionData, 'admin')){
					log.error('Missformed rule, field "admin" is obsolete, use "root" instead: '+req.originalUrl);
				}
				if (Auth.checkCredentials(this.actionData, Auth.isUser(req), Auth.getRole(req), Auth.isRoot(req))){
					return Object.assign({}, this.actionData, this.actionData.rules);
				}
			}
		}
		return null;
	}

	/**
	*	Executes route action if such exist
	*	@param	{object}	req 	Express Request Object
	*	@param	{object}	res		Express Response Object
	*	@param	{function}	callback
	*	@return {object}	result of execution or HttpError
	**/
	exec(req, res, next){
		let rule = this.selectRule(req);
		if (rule){
			if(Object.prototype.hasOwnProperty.call(rule, 'admin')){
				log.log('Route rule options "admin" is obsolete; user "root"');
			}
			let actionName = this.actionName;
			if (rule.actionPrefix){
				actionName = rule.actionPrefix + actionName;
			}else{
				if(rule.actionName){
					actionName = rule.actionName;
				}else{
					if(rule.root || rule.admin /*obsolete*/){
						actionName = '_' + actionName;
					}
				}
			}
			let mod = this.notApp.getModule(this.moduleName);
			if (mod){
				let modRoute = mod.getRoute(this.routeName);
				req.notRouteData = {
					actionName,
					rule,
					'actionData': Object.assign({}, this.actionData)
				};
				if (modRoute && Object.prototype.hasOwnProperty.call(modRoute, actionName) && typeof modRoute[actionName] === 'function'){
					if (Object.prototype.hasOwnProperty.call(modRoute, CONST_BEFORE_ACTION)){
						modRoute[CONST_BEFORE_ACTION](req, res, next);
					}
					let result = modRoute[actionName](req, res, next);
					if (Object.prototype.hasOwnProperty.call(modRoute,CONST_AFTER_ACTION)){
						return modRoute[CONST_AFTER_ACTION](req, res, next);
					}else{
						return result;
					}
				}else{
					return next(new HttpError(404, ['route not found', this.moduleName, this.routeName,actionName].join('; ')));
				}
			}else{
				return next(new HttpError(404, ['module not found', this.moduleName, this.routeName,actionName].join('; ')));
			}
		}else{
			return next(new HttpError(403, ['rule for router not found', this.moduleName, this.routeName].join('; ')));
		}
	}

}

module.exports = notRoute;

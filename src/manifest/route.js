
const	CONST_BEFORE_ACTION = 'before';

const	CONST_AFTER_ACTION = 'after';

const Auth = require('../auth/auth.js'),
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
					if (Auth.checkCredentials(this.actionData.rules[i], Auth.ifUser(req), Auth.getRole(req), Auth.ifAdmin(req))){
						return this.actionData.rules[i];
					}
				}
			}else{
				if (Auth.checkCredentials(this.actionData, Auth.ifUser(req), Auth.getRole(req), Auth.ifAdmin(req))){
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

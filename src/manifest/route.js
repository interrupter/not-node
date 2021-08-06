
const	CONST_BEFORE_ACTION = 'before';

const	CONST_AFTER_ACTION = 'after';

const Auth = require('../auth/auth.js'),
  log = require('not-log')(module, 'not-node'),
  HttpError = require('../error').Http;


const propExist = (obj, name) => Object.prototype.hasOwnProperty.call(obj, name);

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

  static actionAvailableByRule(action, user){
    if (action){
      if(action.rules && action.rules.length > 0){
        for(let i = 0; i < action.rules.length; i++){
          if (Auth.checkCredentials(action.rules[i], user.auth, user.role, user.root)){
            return Object.assign({}, action.rules[i]);
          }
        }
      }else{
        if (Auth.checkCredentials(action, user.auth, user.role, user.root)){
          return Object.assign({}, action, action.rules);
        }
      }
    }
    return null;
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
          if (propExist(this.actionData.rules[i], 'user')){
            log.error('Missformed rule, field "user" is not allowed, use "auth" instead: '+req.originalUrl);
          }
          if (propExist(this.actionData.rules[i], 'admin')){
            log.error('Missformed rule, field "admin" is obsolete, use "root" instead: '+req.originalUrl);
          }
          if (Auth.checkCredentials(this.actionData.rules[i], Auth.isUser(req), Auth.getRole(req), Auth.isRoot(req))){
            return this.actionData.rules[i];
          }
        }
      }else{
        if (propExist(this.actionData, 'user')){
          log.error('Missformed rule, field "user" is not allowed, use "auth" instead: '+req.originalUrl);
        }
        if (propExist(this.actionData, 'admin')){
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
    try{
      let rule = this.selectRule(req);
      if (rule){
        if(propExist(rule, 'admin')){
          log.log('Route rule options "admin" is obsolete; user "root"');
        }
        let actionName = this.selectActionName(rule);
        let mod = this.notApp.getModule(this.moduleName);
        if (mod){
          let modRoute = mod.getRoute(this.routeName);
          req.notRouteData = {
            actionName,
            rule: 				{...rule},
            'actionData': {...this.actionData}
          };
          if (this.routeIsRunnable(modRoute, actionName)){
            return this.executeRoute(modRoute, actionName, {req, res, next});
          }else{
            return next(new HttpError(404, ['route not found', this.moduleName, this.routeName,actionName].join('; ')));
          }
        }else{
          return next(new HttpError(404, ['module not found', this.moduleName, this.routeName,actionName].join('; ')));
        }
      }else{
        return next(new HttpError(403, ['rule for router not found', this.moduleName, this.routeName].join('; ')));
      }
    }catch(e){
      this.notApp.report(e);
    }
  }

  selectActionName(rule){
    let realActionName = this.actionName;
    if (rule.actionPrefix){
      realActionName = rule.actionPrefix + realActionName;
    }else{
      if(rule.actionName){
        realActionName = rule.actionName;
      }else{
        if(rule.root || rule.admin /*obsolete*/){
          realActionName = '_' + realActionName;
        }
      }
    }
    return realActionName;
  }


  routeIsRunnable(modRoute, actionName){
    return (
      modRoute &&
			propExist(modRoute, actionName) &&
			typeof modRoute[actionName] === 'function'
    );
  }

  async executeRoute(modRoute, actionName, {req, res, next}){
    try{
      let prepared = await this.executeFunction(modRoute, CONST_BEFORE_ACTION, [req, res, next]);
      let result = await this.executeFunction(modRoute, actionName, [req, res, next, prepared]);
      return this.executeFunction(modRoute, CONST_AFTER_ACTION, [req, res, next, result]);
    }catch(e){
      this.notApp.report(e);
    }
  }

  async executeFunction(obj, name, params) {
    let result = params.length > 3 ? params[3]:undefined;
    try{
      if (obj &&
				propExist(obj, name) &&
				typeof obj[name] === 'function'
      ) {
        if (obj[name].constructor.name === 'AsyncFunction') {
          return await obj[name](...params);
        } else {
          return obj[name](...params);
        }
      }
    }catch(e){
      this.notApp.report(e);
    }
    return result;
  }

}

module.exports = notRoute;

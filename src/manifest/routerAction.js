const Auth = require('../auth/auth.js'),
	HttpError = require('../error').Http,
	manifest = require('./manifest.js');

var RouterAction = function(modelName, actionName, actionData){
	this.modelName = modelName;
	this.actionName = actionName;
	this.actionData = actionData;
	return this;
};

RouterAction.prototype.selectRule = function(req){
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
};

RouterAction.prototype.exec = function(req, res, next){
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
		var mod = manifest.requiredRoutes[this.modelName];
		if (mod && mod.hasOwnProperty(actionName) && typeof mod[actionName] === 'function'){
			return mod[actionName](req, res, next);
		}else{
			return null;
		}
	}else{
		return next(new HttpError(403, 'rule for router not found'));
	}
};

module.exports = RouterAction;

const HttpError = require('../error').Http;

exports.DEFAULT_USER_ROLE_FOR_ADMIN = 'root';

/* to arrays in - one intersection of two out */
exports.intersect_safe = function(a, b) {
	var result = [];
	if (Array.isArray(a) && Array.isArray(b)){
		if (b.length > a.length){
			// indexOf to loop over shorter
			let t = b;
			b = a; a = t;
		}
		result = a.filter(function (e) {
			if (b.indexOf(e) !== -1) return true;
		});
	}
	return result;
};

exports.ifUser = function(req) {
	return req.session && req.session.user?true:false;
};

exports.checkUser = function(req, res, next) {
	if(this.ifUser(req)) {
		next();
	}else{
		return next(new HttpError(401, 'Вы не авторизованы'));
	}
};

exports.ifAdmin = function(req) {
	return this.ifUser(req) && this.compareRoles(this.getRole(req), this.DEFAULT_USER_ROLE_FOR_ADMIN);
};

exports.checkAdmin = function(req, res, next) {
	if (exports.ifAdmin(req)) {
		next();
	}else{
		return next(new HttpError(401, 'Вы не авторизованы ' + req.session.user + ':' + req.session.userRole));
	}
};

exports.getRole = function(req) {
	return (req.session && req.session.userRole) ? req.session.userRole : undefined;
};

exports.compareRoles = function(userRoles, actionRoles) {
	//console.log('compare roles', userRoles, actionRoles);
	//user have many roles
	if(userRoles && Array.isArray(userRoles)) {
		//action can be accessed by various roles
		if(actionRoles && Array.isArray(actionRoles)) {
			//if we have similar elements in those two arrays - grant access
			return this.intersect_safe(userRoles, actionRoles).length > 0;
		} else {
			return userRoles.indexOf(actionRoles) > -1;
		}
	} else {
		if(Array.isArray(actionRoles)) {
			return actionRoles.indexOf(userRoles) > -1;
		} else {
			return userRoles == actionRoles;
		}
	}
};

exports.checkRoleBuilder = function(role) {
	var that = this;
	return function(req, res, next) {
		var userRole = that.getRole(req);
		if(that.ifUser(req) && that.compareRoles(userRole, role)) {
			next();
		}else{
			return next(new HttpError(401, 'Вы не авторизованы ' + req.session.user + ':' + req.session.userRole));
		}
	};
};

/*
	(object)rule - action rule
		{
			auth - if user should be authenticated
			role - if user shoud have some role
			admin - if user should be super user
		}
	(Boolean)auth - user state of auth
	(String|[String])role - user state of role
	(Boolean)admin - user state of admin

	return Boolean
*/

exports.checkCredentials = function (rule, auth, role, admin){
	if (typeof rule === 'undefined' || rule === null){
		return false;
	}else{
		if (rule.hasOwnProperty('admin') && rule.admin){
			return rule.admin && admin;
		}else{
			if (rule.hasOwnProperty('role')){
				if (exports.compareRoles(rule.role, role)){
					if(rule.hasOwnProperty('auth')){
						if(rule.auth && auth){
							return true;
						}else{
							if(!rule.auth && !auth){
								return true;
							}
						}
					}else{
						return true;
					}
				}else{
					return false;
				}
			}else{
				if(rule.hasOwnProperty('auth')){
					if(rule.auth && auth){
						return true;
					}else{
						if(!rule.auth && !auth){
							return true;
						}
					}
				}else{
					return true;
				}
			}
		}
	}
	return false;
};

/** @module Auth */
const HttpError = require('../error').Http;

exports.DEFAULT_USER_ROLE_FOR_ADMIN = 'root';
exports.DEFAULT_USER_ROLE_FOR_GUEST = 'guest';

/**
*	Two arrays in - one intersection of two out
*	@param	{array}		a	first array
*	@param	{array}		b	scecond array
*	@return {array}		array consisted of elements presented in both input arrays
**/

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

/**
*	Checks if user is authenticated, by searching req.session.user
*	@param	{object}	req 	Express Request object
*	@return {boolean}	true - authenticated, false - guest
**/
exports.ifUser = function(req) {
	return (req.session && req.session.user)?true:false;
};

/**
*	Checks if user is authenticated, by searching req.session.user
*	If auth pass next, else throw error
*	@param	{object}	req 	Express Request object
*	@param	{object}	res 	Express Repost object
*	@param	{function}	next 	callback
**/
exports.checkUser = function(req, res, next) {
	if(this.ifUser(req)) {
		return next();
	}else{
		return next(new HttpError(401, 'Вы не авторизованы'));
	}
};

/**
*	Returns true if user is admin
*	@param	{object}	req 	Express Request object
*	@return {boolean}	true - admin, false - not admin
**/
exports.ifAdmin = function(req) {
	return this.ifUser(req) && this.compareRoles(this.getRole(req), this.DEFAULT_USER_ROLE_FOR_ADMIN);
};

/**
*	Checks if user is authenticated, by searching req.session.user
*	If auth pass next, else throw error
*	@param	{object}	req 	Express Request object
*	@param	{object}	res 	Express Repost object
*	@param	{function}	next 	callback
**/
exports.checkAdmin = function(req, res, next) {
	if (exports.ifAdmin(req)) {
		return next();
	}else{
		return next(new HttpError(401, 'Вы не авторизованы ' + req.session.user + ':' + req.session.role));
	}
};

/**
*	Returns user role from request object
*	@param	{object}	req 	Express Request
*	@return user role
**/
exports.getRole = function(req) {
	return (req.session && req.session.role) ? req.session.role : undefined;
};

/**
*	Set user role for active session
*	@param	{object}	req 	Express Request
*	@param	{string}	role 	role name
**/
exports.setRole = (req, role)=>{
	if(req && req.session){
		req.session.role = role;
	}
};

/**
*	Set user id for active session
*	@param	{object}	req 	Express Request
*	@param	{string}	_id 	user id
**/
exports.setId = (req, _id)=>{
	if(req && req.session){
		req.session.user = _id;
	}
};

/**
*	Set auth data in session, user id and role
*	@param	{object}	req 	Express Request
*	@param	{string}	id 		user id
*	@param	{string}	role 	user role
**/
exports.setAuth = (req, id, role)=>{
	this.setId(req, id);
	this.setRole(req, role);
};


/**
*	Set auth data in session to Guest
*	@param	{object}	req 	Express Request
**/
exports.setGuest = (req)=>{
	if (req.session){
		req.user = null;
		req.session.user = null;
		req.session.role = exports.DEFAULT_USER_ROLE_FOR_GUEST;
	}
};

/**
*	Reset session
*	@param	{object}	req 	Express Request
**/
exports.cleanse = (req)=>{
	if(req && req.session){
		req.session.user = null;
		req.session.role = exports.DEFAULT_USER_ROLE_FOR_GUEST;
		if(req.session.destroy){
			req.session.destroy();
		}
	}
};

/**
*	Compares two list of roles
*	@param	{array|string}	userRoles 		roles of user
*	@param	{array|string}	actionRoles 	roles of action
*	@return {boolean}	if user roles comply to action roles
**/
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

/**
*	Returns Express middleware witch check role against one presented in request
*	@param	{string|array}	role	action roles
*	@return	{function}				express middleware
**/
exports.checkRoleBuilder = function(role) {
	let that = this;
	return function(req, res, next) {
		let userRole = that.getRole(req);
		if(that.ifUser(req) && that.compareRoles(userRole, role)) {
			return next();
		}else{
			return next(new HttpError(401, 'Вы не авторизованы ' + req.session.user + ':' + req.session.role));
		}
	};
};

/**
*	Check rule against presented credentials
*	@param	{object}		rule	action rule
*		{
*			auth - if user should be authenticated
*			role - if user shoud have some role
*			admin - if user should be super user
*		}
*	@param {Boolean}		auth	user state of auth
*	@param {String|Array}	role	user state of role
*	@param {Boolean}		admin	user state of admin
*	@return {boolean}		pass or not
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

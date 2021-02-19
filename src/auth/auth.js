/** @module Auth */
const HttpError = require('../error').Http;
const log = require('not-log')(module, 'Auth');

const DEFAULT_USER_ROLE_FOR_ADMIN = 'root';
const DEFAULT_USER_ROLE_FOR_GUEST = 'guest';

/**
 *	Two arrays in - one intersection of two out
 *	@param	{array}		a	first array
 *	@param	{array}		b	scecond array
 *	@return {array}		array consisted of elements presented in both input arrays
 **/

function intersect_safe(a, b) {
	let result = [];
	if (Array.isArray(a) && Array.isArray(b)) {
		if (b.length > a.length) {
			// indexOf to loop over shorter
			let t = b;
			b = a;
			a = t;
		}
		result = a.filter((e) => {
			if (b.indexOf(e) !== -1) return true;
		});
	}
	return result;
}

/**
 *	Checks if user is authenticated, by searching req.session.user
 *	@param	{object}	req 	Express Request object
 *	@return {boolean}	true - authenticated, false - guest
 **/

function isUser(req) {
	return (req.session && req.session.user) ? true : false;
}

function ifUser(req) {
	log.error('ifUser is obsolete, use new version as isUser');
	return isUser(req);
}


/**
 *	Checks if user is authenticated, by searching req.session.user
 *	If auth pass next, else throw error
 *	@param	{object}	req 	Express Request object
 *	@param	{object}	res 	Express Repost object
 *	@param	{function}	next 	callback
 **/
function checkUser(req, res, next) {
	if (isUser(req)) {
		return next();
	} else {
		return next(new HttpError(401, 'Вы не авторизованы'));
	}
}

/**
 *	Returns true if user is admin
 *	@param	{object}	req 	Express Request object
 *	@return {boolean}	true - admin, false - not admin
 **/
function ifAdmin(req) {
	log.error('ifAdmin is obsolete, use new version as isRoot');
	return isRoot(req);
}

function isRoot(req) {
	return isUser(req) && compareRoles(getRole(req), DEFAULT_USER_ROLE_FOR_ADMIN);
}

/**
 *	Checks if user is authenticated, by searching req.session.user
 *	If auth pass next, else throw error
 *	@param	{object}	req 	Express Request object
 *	@param	{object}	res 	Express Repost object
 *	@param	{function}	next 	callback
 **/
function checkAdmin(req, res, next) {
	log.error('checkAdmin is obsolete, use new version as checkRoot');
	return checkRoot(req, res, next);
}

function checkRoot(req, res, next) {
	if (isRoot(req)) {
		return next();
	} else {
		return next(new HttpError(401, 'Вы не авторизованы ' + req.session.user + ':' + req.session.role));
	}
}

/**
 *	Returns user role from request object
 *	@param	{object}	req 	Express Request
 *	@return user role
 **/
function getRole(req) {
	return (req.session && req.session.role) ? req.session.role : undefined;
}

/**
 *	Set user role for active session
 *	@param	{object}	req 	Express Request
 *	@param	{[string]}	role 	array of roles
 **/
function setRole(req, role) {
	if (req && req.session) {
		req.session.role = role;
	}
}

function setId(req, _id) {
	log.error('setId is obsolete, use new version as setUserId');
	return setUserId(req, _id);
}

/**
 *	Set user id for active session
 *	@param	{object}	req 	Express Request
 *	@param	{string}	_id 	user id
 **/
function setUserId(req, _id) {
	if (req && req.session) {
		req.session.user = _id;
	}
}

/**
 *	Get user id for active session
 *	@param	{object}	req 	Express Request
 **/
function getUserId(req) {
	return req.session.user;
}

/**
 *	Get session id for active session
 *	@param	{object}	req 	Express Request
 **/
function getSessionId(req) {
	return req.session.id.toString();
}

/**
 *	Get request ip
 *	@param	{object}	req 	Express Request
 **/
function getIP(req) {
	return req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
}

/**
 *	Set auth data in session, user id and role
 *	@param	{object}	req 	Express Request
 *	@param	{string}	id 		user id
 *	@param	{string}	role 	user role
 **/
function setAuth(req, id, role) {
	setId(req, id);
	setRole(req, role);
}

/**
 *	Set auth data in session to Guest
 *	@param	{object}	req 	Express Request
 **/
function setGuest(req) {
	if (req.session) {
		req.user = null;
		req.session.user = null;
		setRole(req, [DEFAULT_USER_ROLE_FOR_GUEST]);
	}
}

/**
 *	Reset session
 *	@param	{object}	req 	Express Request
 **/
function cleanse(req) {
	if (req && req.session) {
		setGuest(req);
		if (req.session.destroy) {
			req.session.destroy();
		}
	}
}

/**
 *	Collects various authentification and authorization data from request object
 *	@params {object}	req 			ExpressRequest
 * @return {object}  various authentification data for actor { root:boolean, auth: boolean, role: [string], uid: ObjectId, sid: string, ip:string }
 */
function extractAuthData(req) {
	return {
		root: 	isRoot(req),
		auth: 	isUser(req),
		role: 	getRole(req),
		uid: 		getUserId(req),
		sid: 		getSessionId(req),
		ip: 		getIP(req)
	};
}

/**
 *	Compares two list of roles
 *	@param	{array|string}	userRoles 		roles of user
 *	@param	{array|string}	actionRoles 	roles of action
 *	@param	{boolean}				strict 				if true userRoles should contain all of actionRoles. else atleast one
 *	@return {boolean}	if user roles comply to action roles
 **/
function compareRoles(userRoles, actionRoles, strict = true) {
	//console.log('compare roles', userRoles, actionRoles);
	//user have many roles
	if (userRoles && Array.isArray(userRoles)) {
		//action can be accessed by various roles
		if (actionRoles && Array.isArray(actionRoles)) {
			//if we have similar elements in those two arrays - grant access
			if(strict){
				return intersect_safe(userRoles, actionRoles).length === actionRoles.length;
			}else{
				return intersect_safe(userRoles, actionRoles).length > 0;
			}
		} else {
			return userRoles.indexOf(actionRoles) > -1;
		}
	} else {
		if (Array.isArray(actionRoles)) {
			if(strict){
				return false;
			}else{
				return actionRoles.indexOf(userRoles) > -1;
			}
		} else {
			return userRoles === actionRoles;
		}
	}
}

/**
 *	Returns Express middleware witch check role against one presented in request
 *	@param	{string|array}	role	action roles
 *	@return	{function}				express middleware
 **/
function checkRoleBuilder(role) {
	return (req, res, next) => {
		let userRole = getRole(req);
		if (isUser(req) && compareRoles(userRole, role)) {
			return next();
		} else {
			return next(new HttpError(401, 'Вы не авторизованы ' + req.session.user + ':' + req.session.role));
		}
	};
}

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
function checkCredentials(rule, auth, role, admin) {
	if (typeof rule === 'undefined' || rule === null) {
		return false;
	} else {
		if (Object.prototype.hasOwnProperty.call(rule, 'user')){
			log.error('Missformed rule, field "user" is not allowed, use "auth" instead');
		}
		if (Object.prototype.hasOwnProperty.call(rule, 'admin')){
			log.error('Missformed rule, field "admin" is obsolete, use "root" instead');
		}
		if ((Object.prototype.hasOwnProperty.call(rule, 'admin') && rule.admin) || (Object.prototype.hasOwnProperty.call(rule, 'root') && rule.root)) {
			if (Object.prototype.hasOwnProperty.call(rule, 'admin')) {
				return rule.admin && admin;
			} else {
				return rule.root && admin;
			}
		} else {
			if (Object.prototype.hasOwnProperty.call(rule, 'role')) {
				if (compareRoles(rule.role, role)) {
					if (Object.prototype.hasOwnProperty.call(rule, 'auth')) {
						if (rule.auth && auth) {
							return true;
						} else {
							if (!rule.auth && !auth) {
								return true;
							}
						}
					} else {
						return true;
					}
				} else {
					return false;
				}
			} else {
				if (Object.prototype.hasOwnProperty.call(rule, 'auth')) {
					if (rule.auth && auth) {
						return true;
					} else {
						if (!rule.auth && !auth) {
							return true;
						}
					}
				} else if (Object.prototype.hasOwnProperty.call(rule, 'user')) {
					if (rule.user && auth) {
						return true;
					} else {
						if (!rule.user && !auth) {
							return true;
						}
					}
				}else {
					return true;
				}
			}
		}
	}
	return false;
}

/**
 *	Check to sets of roles against each other
 * to define if base is strictly higher than second
 *	@param	{String|Array}		base				first set of roles
 *	@param	{String|Array}		against			second set of roles
 *	@param 	{Array}						roles				roles in order of supremacy from highest to lowest
 *	@return {boolean}					true if base > against
 */
function checkSupremacy(base, against, roles) {
	if ((!Array.isArray(base)) && (Object.prototype.toString.call(base) !== '[object String]')) {
		throw new Error('Base role set is not valid');
	} else {
		if (!Array.isArray(base)) {
			base = [base];
		}
	}

	if ((!Array.isArray(against)) && (Object.prototype.toString.call(against) !== '[object String]')) {
		throw new Error('Against role set is not valid');
	} else {
		if (!Array.isArray(against)) {
			against = [against];
		}
	}

	if (!Array.isArray(roles)) {
		throw new Error('No roles supremacy order!');
	}

	let baseIndex = -1;
	let againstIndex = -1;
	roles.forEach((role, index) => {
		if ((Object.prototype.toString.call(role) !== '[object String]')) {
			throw new Error('Supremacy order element is not a string');
		}
		if (baseIndex === -1) {
			if (base.indexOf(role) > -1) {
				baseIndex = index;
			}
		}
		if (againstIndex === -1) {
			if (against.indexOf(role) > -1) {
				againstIndex = index;
			}
		}
	});
	if ((baseIndex > -1) && ((baseIndex < againstIndex) || againstIndex === -1)) {
		return true;
	} else {
		return false;
	}
}

function extractSafeFields(schema, action, data, roles, actorId, system = false) {
	let fields = getSafeFieldsForRoleAction(schema, action, roles, isOwner(data, actorId), system);
	let result = {};
	fields.forEach((field) => {
		if (Object.prototype.hasOwnProperty.call(data, field)) {
			result[field] = data[field];
		}
	});
	return result;
}

function getSafeFieldsForRoleAction(schema, action, roles, owner, system) {
	let fields = [];
	let special = [];
	if (owner) {
		special.push('@owner');
	}
	if (system) {
		special.push('@system');
	}
	for (let t in schema) {
		let field = schema[t];
		if (Object.prototype.hasOwnProperty.call(field, 'safe')) {
			if (Object.prototype.hasOwnProperty.call(field.safe, action)) {
				if (field.safe[action] === '*') {
					fields.push(t);
				} else if (Array.isArray(field.safe[action])) {
					if ( //если роли пользователя в списке
						intersect_safe(roles, field.safe[action]) ||
						//или он в спец группе (владелец, система)
						intersect_safe(special, field.safe[action])
					) {
						fields.push(t);
					}
				}
			}
		}
	}
	return fields;
}

function isOwner(data, user_id) {
	if (typeof user_id === 'undefined' || user_id === 0) {
		return false;
	}
	return (Object.prototype.hasOwnProperty.call(data, '_id') && data._id.toString() === user_id.toString());
}

module.exports = {
	DEFAULT_USER_ROLE_FOR_ADMIN,
	DEFAULT_USER_ROLE_FOR_GUEST,
	intersect_safe,
	ifUser,
	isUser,
	checkUser,
	ifAdmin,
	isRoot,
	checkAdmin,
	checkRoot,
	getRole,
	setRole,
	setId,
	setUserId,
	getUserId,
	getSessionId,
	getIP,
	setAuth,
	setGuest,
	cleanse,
	extractAuthData,
	compareRoles,
	checkRoleBuilder,
	checkCredentials,
	checkSupremacy,
	extractSafeFields,
	getSafeFieldsForRoleAction,
	isOwner
};

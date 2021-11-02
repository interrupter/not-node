const log = require('not-log')(module, 'Auth');
const CONST = require('./const');
const ROLES = require('./roles');

/**
 *	Checks if user is authenticated, by searching req.session.user
 *	@param	{object}	req 	Express Request object
 *	@return {boolean}	true - authenticated, false - guest
 **/

function isUser(req) {
  return (req && req.session && req.session.user) ? true : false;
}

function ifUser(req) {
  log.error('ifUser is obsolete, use new version as isUser');
  return isUser(req);
}

/**
 *	Returns user role from request object
 *	@param	{object}	req 	Express Request
 *	@return user role
 **/
function getRole(req) {
  return (req && req.session && req.session.role) ? req.session.role : undefined;
}

/**
 *	Set user role for active session
 *	@param	{object}	req 	Express Request
 *	@param	{Array<string>}	role 	array of roles
 **/
function setRole(req, role) {
  if (req && req.session) {
    req.session.role = role;
  }
}

function setId(req, _id) {
  log.error('setId is obsolete, use new version as setUserId');
  log.error(req.originalUrl);
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
 *	Returns true if user is admin
 *	@param	{object}	req 	Express Request object
 *	@return {boolean}	true - admin, false - not admin
 **/
function ifAdmin(req) {
  log.error('ifAdmin is obsolete, use new version as isRoot');
  log.error(req.originalUrl);
  return isRoot(req);
}

function isRoot(req) {
  return isUser(req) && ROLES.compareRoles(getRole(req), CONST.DEFAULT_USER_ROLE_FOR_ADMIN);
}




/**
 *	Get user id for active session
 *	@param	{object}	req 	Express Request
 **/
function getUserId(req) {
  if(req && req.session){
    return req.session.user;
  }else{
    return undefined;
  }
}

/**
 *	Get session id for active session
 *	@param	{object}	req 	Express Request
 **/
function getSessionId(req) {
  if(req && req.session && req.session.id){
    return req.session.id.toString();
  }else{
    return undefined;
  }
}


/**
 *	Set auth data in session, user id and role
 *	@param	{object}	req 	Express Request
 *	@param	{string}	id 		user id
 *	@param	{string}	role 	user role
 **/
function setAuth(req, id, role) {
  setUserId(req, id);
  setRole(req, role);
}


/**
 *	Set auth data in session to Guest
 *	@param	{object}	req 	Express Request
 **/
function setGuest(req) {
  if (req && req.session) {
    req.user = null;
    req.session.user = null;
    setRole(req, [CONST.DEFAULT_USER_ROLE_FOR_GUEST]);
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


module.exports = {
  isUser,
  ifUser,
  ifAdmin,
  isRoot,
  getRole,
  setRole,
  setId,
  getUserId,
  setUserId,
  getSessionId,
  setAuth,
  setGuest,
  cleanse
};

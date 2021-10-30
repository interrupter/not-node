const ROLES = require('./roles');
const postWarning = require('../obsolete');

function ruleHasRootDirective(rule){
  return (Object.prototype.hasOwnProperty.call(rule, 'admin') && rule.admin) || (Object.prototype.hasOwnProperty.call(rule, 'root') && rule.root);
}


function compareWithRoot(rule, admin){
  if (Object.prototype.hasOwnProperty.call(rule, 'admin')) {
    return rule.admin && admin;
  } else {
    return rule.root && admin;
  }
}

function compareRuleRoles(rule, role, auth){
  if (ROLES.compareRoles(rule.role, role)) {
    if (Object.prototype.hasOwnProperty.call(rule, 'auth')) {
      if (rule.auth && auth) {
        return true;
      } else {
        return (!rule.auth && !auth);
      }
    } else {
      return true;
    }
  } else {
    return false;
  }
}

function roleRequireAuthState(requiredAuth, userAuth){
  if (requiredAuth && userAuth) {
    return true;
  } else {
    return (!requiredAuth && !userAuth);
  }
}

function compareAuthStatus(rule, auth){
  if (Object.prototype.hasOwnProperty.call(rule, 'auth')) {
    return roleRequireAuthState(rule.auth, auth);
  } else if (Object.prototype.hasOwnProperty.call(rule, 'user')) {
    return roleRequireAuthState(rule.user, auth);
  }else {
    return true;
  }
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
  //no rule - no access
  if (typeof rule === 'undefined' || rule === null) {
    return false;
  } else {
    //posting message about obsolete options keys if found
    postWarning(rule);
    //start comparing from top tier flags
    //if we have root/admin(obsolete) field field in rule compare only it
    if (ruleHasRootDirective(rule)) {
      return compareWithRoot(rule, admin);
    } else {
      //if we have roles in rule, then using role based aproach
      if (Object.prototype.hasOwnProperty.call(rule, 'role')) {
        return compareRuleRoles(rule, role, auth);
      } else {
        //if no then just
        return compareAuthStatus(rule, auth);
      }
    }
  }
}


module.exports = {
  checkCredentials,
  compareAuthStatus,
  roleRequireAuthState,
  compareRuleRoles,
  compareWithRoot,
  ruleHasRootDirective
};

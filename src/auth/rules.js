const ROLES = require("./roles");
const postWarning = require("../obsolete");
const { objHas } = require("../common");

function ruleHasRootDirective(rule) {
    return (
        (objHas(rule, "admin") && rule.admin) ||
        (objHas(rule, "root") && rule.root)
    );
}

function compareWithRoot(rule, root) {
    if (objHas(rule, "admin")) {
        return rule.admin && root;
    } else {
        return rule.root && root;
    }
}

function compareRuleRoles(actionRule, userRole, auth) {
    if (ROLES.compareRoles(userRole, actionRule.role)) {
        if (objHas(actionRule, "auth")) {
            if (actionRule.auth && auth) {
                return true;
            } else {
                return !actionRule.auth && !auth;
            }
        } else {
            return true;
        }
    } else {
        return false;
    }
}

function roleRequireAuthState(requiredAuth, userAuth) {
    if (requiredAuth && userAuth) {
        return true;
    } else {
        return !requiredAuth && !userAuth;
    }
}

function compareAuthStatus(rule, auth) {
    if (objHas(rule, "auth")) {
        return roleRequireAuthState(rule.auth, auth);
    } else if (objHas(rule, "user")) {
        return roleRequireAuthState(rule.user, auth);
    } else {
        return true;
    }
}

/**
 *	Check rule against presented credentials
 *	@param	{object}		        rule	      action rule
 *  @param	{boolean}		        rule.auth   if user should be authenticated
 *  @param	{Array<String>}		  rule.role   if user shoud have some role
 *  @param	{boolean}		        rule.root   if user should be super user
 *	@param  {Boolean}		        auth	      user state of auth
 *	@param  {String|Array}	    role	      user state of role
 *	@param  {Boolean}		        root        user state of root
 *	@return {boolean}		        pass or not
 */
function checkCredentials(rule, auth, role, root) {
    //no rule - no access
    if (typeof rule === "undefined" || rule === null) {
        return false;
    } else {
        //posting message about obsolete options keys if found
        postWarning(rule);
        //start comparing from top tier flags
        //if we have root/admin(obsolete) field field in rule compare only it
        if (ruleHasRootDirective(rule)) {
            return compareWithRoot(rule, root);
        } else {
            //if we have roles in rule, then using role based aproach
            if (objHas(rule, "role")) {
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
    ruleHasRootDirective,
};

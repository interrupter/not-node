const ROLES = require("./roles");
const postWarning = require("../obsolete");
const { objHas } = require("../common");

/**
 * check if rule contains requirement about root/admin(obs) status of requester
 *
 * @param {import('../types').notRouteRule} rule
 * @return {boolean}
 */
function ruleHasRootDirective(rule) {
    return (
        (objHas(rule, "admin") && typeof rule.admin !== "undefined") ||
        (objHas(rule, "root") && typeof rule.root !== "undefined")
    );
}

/**
 * checks if requester `root` state comply rule of route action
 *
 * @param {import('../types').notRouteRule}     rule    rule to comply
 * @param {boolean}                             root    actual requester state
 * @return {boolean}
 */
function compareWithRoot(rule, root) {
    if (objHas(rule, "admin")) {
        return typeof rule.admin !== "undefined" && rule.admin && root;
    } else {
        return typeof rule.root !== "undefined" && rule.root && root;
    }
}

/**
 * checks roles list (in strict mode) then if auth state check needed performs it
 * returns true if all checks passed or false if needed failed
 *
 * @param {import('../types').notRouteRule}     actionRule  rule to comply
 * @param {Array<string>}                       userRole    array of user roles
 * @param {boolean}                             auth        if user authenticated
 * @return {boolean}
 */
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

/**
 *  checks if user in required state of authetification
 *
 * @param {boolean} requiredAuth
 * @param {boolean} userAuth
 * @return {boolean}
 */
function roleRequireAuthState(requiredAuth, userAuth) {
    //to pass
    //or true and true
    if (requiredAuth && userAuth) {
        return true;
    } else {
        //or !false && !false
        return !requiredAuth && !userAuth;
    }
}

/**
 * default outcome - true, if no requirements in rule
 *
 * @param {import('../types').notRouteRule}     rule    rule to comply
 * @param {boolean}                             auth    actual state of requester
 * @return {boolean}
 */
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
 *	@param	{import('../types').notRouteRule}		        rule	        action rule
 *	@param  {boolean}		                                auth	        user state of auth
 *	@param  {string|Array<string>}	                                role	user state of role
 *	@param  {boolean}		                                root            user state of root
 *	@return {boolean}		                                                pass or not
 */
function checkCredentials(rule, auth, role, root) {
    //no rule - no access
    if (typeof rule === "undefined" || rule === null) {
        return false;
    } else {
        //posting message about obsolete options keys if found
        postWarning.obsoleteRuleFields(rule);
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

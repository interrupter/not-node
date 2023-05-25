const ABSTRACT = require("./abstract");
const {
    RolesExceptionRoleSetIsNotValid,
    RolesExceptionNoRolesSupremacyOrder,
    RolesExceptionSupremacyOrderElementIsNotAString,
} = require("./exceptions.js");

function compareRolesArrayAgainstArray(userRoles, actionRoles, strict) {
    if (strict) {
        return (
            ABSTRACT.intersect_safe(userRoles, actionRoles).length ===
            actionRoles.length
        );
    } else {
        return ABSTRACT.intersect_safe(userRoles, actionRoles).length > 0;
    }
}

function compareRolesStrict(userRoles, actionRoles) {
    if (actionRoles.length === 1) {
        return actionRoles.includes(userRoles);
    } else {
        return false;
    }
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
            return compareRolesArrayAgainstArray(
                userRoles,
                actionRoles,
                strict
            );
        } else {
            return userRoles.indexOf(actionRoles) > -1;
        }
    } else {
        if (Array.isArray(actionRoles)) {
            if (strict) {
                return compareRolesStrict(userRoles, actionRoles);
            } else {
                return actionRoles.indexOf(userRoles) > -1;
            }
        } else {
            return userRoles === actionRoles;
        }
    }
}

function sanitizeAndValidateRoleSet(roleSet, name) {
    if (!Array.isArray(roleSet) && !ABSTRACT.isObjectString(roleSet)) {
        throw new RolesExceptionRoleSetIsNotValid(name);
    } else {
        if (!Array.isArray(roleSet)) {
            roleSet = [roleSet];
        }
    }
    return roleSet;
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
    base = sanitizeAndValidateRoleSet(base, "Base");
    against = sanitizeAndValidateRoleSet(against, "Against");

    if (!Array.isArray(roles)) {
        throw new RolesExceptionNoRolesSupremacyOrder();
    }

    let baseIndex = -1;
    let againstIndex = -1;
    roles.forEach((role, index) => {
        if (!ABSTRACT.isObjectString(role)) {
            throw new RolesExceptionSupremacyOrderElementIsNotAString();
        }
        if (baseIndex === -1 && base.indexOf(role) > -1) {
            baseIndex = index;
        }
        if (againstIndex === -1 && against.indexOf(role) > -1) {
            againstIndex = index;
        }
    });
    return baseIndex > -1 && (baseIndex < againstIndex || againstIndex === -1);
}

module.exports = {
    checkSupremacy,
    sanitizeAndValidateRoleSet,
    compareRoles,
    compareRolesArrayAgainstArray,
};

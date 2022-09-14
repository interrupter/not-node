const {
    HttpExceptionUnauthorized,
    HttpExceptionForbidden,
} = require("../exceptions/http");

const { log } = require("not-log")(module, "Auth/Routes");
const ROLES = require("./roles");
const notAppIdentity = require("../identity");
const { getIP } = require("../common");

/**
 *  Returns Express middleware witch check role against one presented in request
 *  @param  {string|array}  role  action roles
 *  @return  {function}        express middleware
 **/
function checkRoleBuilder(role) {
    return (req, res, next) => {
        const identity = new notAppIdentity(req);
        const userRole = identity.getRole();
        const userId = identity.getUserId();
        if (!identity.isUser()) {
            return next(
                new HttpExceptionUnauthorized({
                    params: { ip: getIP(req) },
                })
            );
        }
        if (ROLES.compareRoles(userRole, role)) {
            return next();
        } else {
            return next(
                new HttpExceptionForbidden({
                    params: {
                        ip: getIP(req),
                        user: userId,
                        role: userRole,
                    },
                })
            );
        }
    };
}

/**
 *  Checks if user is authenticated, by searching in Identity associated with request
 *  If auth pass next, else throw error
 *  @param  {object}  req   Express Request object
 *  @param  {object}  res   Express Repost object
 *  @param  {function}  next   callback
 **/
function checkUser(req, res, next) {
    const identity = new notAppIdentity(req);
    if (identity.isUser()) {
        return next();
    } else {
        return next(
            new HttpExceptionUnauthorized({
                params: { ip: getIP(req) },
            })
        );
    }
}

function checkRoot(req, res, next) {
    const identity = new notAppIdentity(req);
    if (identity.isRoot()) {
        return next();
    } else {
        if (identity.isUser()) {
            return next(
                new HttpExceptionForbidden({
                    params: {
                        ip: getIP(req),
                        user: identity.getUserId(),
                        role: identity.getRole(),
                    },
                })
            );
        } else {
            return next(
                new HttpExceptionUnauthorized({
                    params: { ip: getIP(req) },
                })
            );
        }
    }
}

function extractAuthData(req) {
    log(
        "Obsolete path notAuth.extractAuthData(req), use notAppIdentity.extractAuthData(req) instead"
    );
    return notAppIdentity.extractAuthData(req);
}

module.exports = {
    checkRoot,
    checkUser,
    checkRoleBuilder,
    extractAuthData,
    getIP,
};

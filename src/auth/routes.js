const log = require("not-log")(module, "Auth");
const {
    HttpExceptionUnauthorized,
    HttpExceptionForbidden,
} = require("../exceptions/http");
const SESSION = require("./session");
const ROLES = require("./roles");

/**
 *  Get request ip
 *  @param  {object}  req   Express Request
 **/
function getIP(req) {
    if (req) {
        return (
            (req.headers && req.headers["x-forwarded-for"]) ||
            (req.connection && req.connection.remoteAddress) ||
            (req.socket && req.socket.remoteAddress) ||
            (req.connection &&
                req.connection.socket &&
                req.connection.socket.remoteAddress)
        );
    } else {
        return undefined;
    }
}

/**
 *  Collects various authentification and authorization data from request object
 *  @params {object}  req       ExpressRequest
 * @return {object}  various authentification data for actor { root:boolean, auth: boolean, role: [string], uid: ObjectId, sid: string, ip:string }
 */
function extractAuthData(req) {
    return {
        root: SESSION.isRoot(req),
        auth: SESSION.isUser(req),
        role: SESSION.getRole(req),
        uid: SESSION.getUserId(req),
        sid: SESSION.getSessionId(req),
        ip: getIP(req),
    };
}

/**
 *  Returns Express middleware witch check role against one presented in request
 *  @param  {string|array}  role  action roles
 *  @return  {function}        express middleware
 **/
function checkRoleBuilder(role) {
    return (req, res, next) => {
        let userRole = SESSION.getRole(req);
        if (!SESSION.isUser(req)) {
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
                        user: req.session.user,
                        role: req.session.role,
                    },
                })
            );
        }
    };
}

/**
 *  Checks if user is authenticated, by searching req.session.user
 *  If auth pass next, else throw error
 *  @param  {object}  req   Express Request object
 *  @param  {object}  res   Express Repost object
 *  @param  {function}  next   callback
 **/
function checkUser(req, res, next) {
    if (SESSION.isUser(req)) {
        return next();
    } else {
        return next(
            new HttpExceptionUnauthorized({
                params: { ip: getIP(req) },
            })
        );
    }
}

/**
 *  Checks if user is authenticated, by searching req.session.user
 *  If auth pass next, else throw error
 *  @param  {object}  req   Express Request object
 *  @param  {object}  res   Express Repost object
 *  @param  {function}  next   callback
 **/
function checkAdmin(req, res, next) {
    log.error("checkAdmin is obsolete, use new version as checkRoot");
    log.error(req.originalUrl);
    return checkRoot(req, res, next);
}

function checkRoot(req, res, next) {
    if (SESSION.isRoot(req)) {
        return next();
    } else {
        if (SESSION.isUser(req)) {
            return next(
                new HttpExceptionForbidden({
                    params: {
                        ip: getIP(req),
                        user: req.session.user,
                        role: req.session.role,
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

module.exports = {
    checkRoot,
    checkAdmin,
    checkUser,
    checkRoleBuilder,
    extractAuthData,
    getIP,
};

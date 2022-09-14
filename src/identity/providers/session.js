const CONST = require("../../auth/const");
const ROLES = require("../../auth/roles");

module.exports = class IdentityProviderSession {
    constructor(req) {
        this.req = req;
        return this;
    }

    /**
     *	Checks if user is authenticated, by searching req.session.user
     *	@return {boolean}	true - authenticated, false - guest
     **/

    isUser() {
        const req = this.req;
        return req && req.session && req.session.user ? true : false;
    }

    /**
     *	Returns user role from request object
     *	@return user role
     **/
    getRole() {
        const req = this.req;
        return req && req.session && req.session.role
            ? req.session.role
            : undefined;
    }

    /**
     *	Set user role for active session
     *	@param	{Array<string>}	role 	array of roles
     **/
    setRole(role) {
        const req = this.req;
        if (req && req.session) {
            req.session.role = role;
        }
    }

    /**
     *	Set user id for active session
     *	@param	{string}	_id 	user id
     **/
    setUserId(_id) {
        const req = this.req;
        if (req && req.session) {
            req.session.user = _id;
        }
    }

    isRoot() {
        return (
            this.isUser() &&
            ROLES.compareRoles(
                this.getRole(),
                CONST.DEFAULT_USER_ROLE_FOR_ADMIN
            )
        );
    }

    /**
     *	Get user id for active session
     **/
    getUserId() {
        const req = this.req;
        if (req && req.session) {
            return req.session.user;
        } else {
            return undefined;
        }
    }

    /**
     *	Get session id for active session
     **/
    getSessionId() {
        const req = this.req;
        if (req && req.session && req.session.id) {
            return req.session.id.toString();
        } else {
            return undefined;
        }
    }

    /**
     *	Set auth data in session, user id and role
     *	@param	{string}	id 		user id
     *	@param	{string}	role 	user role
     **/
    setAuth(id, role) {
        this.setUserId(id);
        this.setRole(role);
    }

    /**
     *	Set auth data in session to Guest
     **/
    setGuest() {
        const req = this.req;
        if (req && req.session) {
            req.user = null;
            req.session.user = null;
            this.setRole([CONST.DEFAULT_USER_ROLE_FOR_GUEST]);
        }
    }

    /**
     *	Reset session
     **/
    cleanse() {
        const req = this.req;
        if (req && req.session) {
            this.setGuest();
            if (req.session.destroy) {
                req.session.destroy();
            }
        }
    }
};
const { error } = require("not-log")(module, "Auth");
const CONST = require("../../auth/const");
const ROLES = require("../../auth/roles");

const JWT = require("jsonwebtoken");

module.exports = class IdentityProviderToken {
    #options = null;
    #tokenContent = null;
    #token = null;

    constructor(req, options = { secret: "" }) {
        this.#options = options;
        this.#extractToken(req);
        this.#extractTokenContent();
        return this;
    }

    getTokenFromRequest(req) {
        const auth = req.get("Authorization");
        if (auth && auth.length) {
            const [, token] = auth.split(" ");
            return token;
        }
        return null;
    }

    #extractToken(req) {
        const token = this.getTokenFromRequest(req);
        if (token) {
            this.#token = token;
        }
    }

    #updateToken() {
        this.#token = this.#encodeTokenContent();
        return this.#token;
    }

    #decodeTokenContent() {
        try {
            if (this.#token) {
                const secret = this.#getOptions().secret;
                JWT.verify(this.#token, secret);
                return JWT.decode(this.#token, secret);
            }
            return null;
        } catch (e) {
            error(e.message);
            return null;
        }
    }

    #encodeTokenContent() {
        try {
            if (this.#token) {
                const secret = this.#getOptions().secret;
                return JWT.sign(this.#tokenContent, secret);
            }
            return null;
        } catch (e) {
            error(e.message);
            return null;
        }
    }

    #extractTokenContent(req) {
        this.#tokenContent = this.#decodeTokenContent(req);
    }

    #getOptions() {
        return this.#options;
    }

    get tokenContent() {
        return this.#tokenContent;
    }

    get token() {
        return this.#token;
    }

    /**
     *	Checks if user is authenticated
     *	@return {boolean}	true - authenticated, false - guest
     **/
    isUser() {
        return !!this.tokenContent._id;
    }

    /**
     *	Returns user role from token object
     *	@return user role
     **/
    getRole() {
        return this.tokenContent?.role ?? CONST.DEFAULT_USER_ROLE_FOR_GUEST;
    }

    /**
     *	Set user role for active session
     *	@param	{Array<string>}	role 	array of roles
     **/
    setRole(role) {
        this.#tokenContent.role = [...role];
        this.#updateToken();
        return this;
    }

    /**
     *	Set user id for active session
     *	@param	{string}	_id 	user id
     **/
    setUserId(_id) {
        this.#tokenContent._id = _id;
        this.#updateToken();
        return this;
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
        return this.#tokenContent?._id;
    }

    /**
     *	returns token
     **/
    getSessionId() {
        return this.token;
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
     *	Set auth data in token to Guest
     **/
    setGuest() {
        this.setAuth(null, [CONST.DEFAULT_USER_ROLE_FOR_GUEST]);
    }

    /**
     *	Reset session
     *	@param	{object}	req 	Express Request
     **/
    cleanse() {
        this.setGuest();
    }
};

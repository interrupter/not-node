const { error, log } = require("not-log")(module, "Identity//Token");
const { notRequestError } = require("not-error");
const CONST = require("../../auth/const");
const ROLES = require("../../auth/roles");
const { objHas } = require("../../common");
const phrase = require("not-locale").modulePhrase("not-node");

const JWT = require("jsonwebtoken");

module.exports = class IdentityProviderToken {
    #tokenContent = null;
    #token = null;

    static #options = {};

    static setOptions(options = {}) {
        this.#options = options;
    }

    static #getOptions() {
        return this.#options;
    }

    static setPrimaryRoles(list = []) {
        IdentityProviderToken.#getOptions().primaryRoles = [...list];
    }

    static setSecondaryRoles(list = []) {
        IdentityProviderToken.#getOptions().secondaryRoles = [...list];
    }

    constructor(req) {
        this.req = req;
        this.#extractToken(req);
        this.#extractTokenContent();
        return this;
    }

    static getTokenFromRequest(req) {
        const auth = req.get("Authorization");
        if (auth && auth.length) {
            const [, token] = auth.split(" ");
            console.log("token found", token);
            return token;
        }
        return null;
    }

    #extractToken(req) {
        const token = IdentityProviderToken.getTokenFromRequest(req);
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
                const secret = IdentityProviderToken.#getOptions().secret;
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
                const secret = IdentityProviderToken.#getOptions().secret;
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

    get tokenContent() {
        return this.#tokenContent;
    }

    get token() {
        return this.#token;
    }

    static #validateSecretForToken({ secret, context }) {
        if (
            !secret ||
            typeof secret === "undefined" ||
            secret === null ||
            secret === ""
        ) {
            throw new notRequestError(phrase("user_token_secret_not_valid"), {
                ...context,
                code: 500,
            });
        }
    }

    static #validateTTLForToken(tokenTTL) {
        if (tokenTTL <= 0 || isNaN(tokenTTL)) {
            log(phrase("user_token_ttl_not_set"));
            tokenTTL = CONST.TOKEN_TTL;
        }
        return tokenTTL;
    }

    static #composeUserTokenPayload({ user, additionalFields = [] }) {
        const addons = {};
        if (Array.isArray(additionalFields)) {
            additionalFields.forEach((fieldName) => {
                if (objHas(user, fieldName)) {
                    addons[fieldName] = user[fieldName];
                }
            });
        }
        return {
            _id: user._id,
            role: user.role,
            active: user.active,
            username: user.username,
            ...addons,
        };
    }

    static #composeGuestTokenPayload() {
        return {
            _id: false,
            role: CONST.DEFAULT_USER_ROLE_FOR_GUEST,
            active: true,
            username: phrase("user_role_guest"),
        };
    }

    static createToken({
        ip,
        user,
        additionalFields = ["emailConfirmed", "telephoneConfirmed"],
    }) {
        const context = { ip };
        const secret = this.#getOptions().secret;
        this.#validateSecretForToken({ secret, context });
        let payload = {};
        if (user) {
            payload = this.#composeUserTokenPayload({ user, additionalFields });
        } else {
            payload = this.#composeGuestTokenPayload();
        }
        this.#setTokenExpiration(payload);
        return JWT.sign(payload, secret);
    }

    static #setTokenExpiration(payload) {
        const tokenTTL = this.#validateTTLForToken(this.#getOptions().ttl);
        if (!objHas(payload, "exp")) {
            payload.exp = Date.now() / 1000 + tokenTTL;
        }
    }

    /**
     *	Checks if user is authenticated
     *	@return {boolean}	true - authenticated, false - guest
     **/
    isUser() {
        return !!this.tokenContent?._id;
    }

    /**
     *	Returns primary user role from request object
     *	@return {string} user role
     **/
    getPrimaryRole() {
        const roles = this.getRole();
        for (let role of roles) {
            if (
                IdentityProviderToken.#getOptions().primaryRoles.includes(role)
            ) {
                return role;
            }
        }
        return CONST.DEFAULT_USER_ROLE_FOR_GUEST;
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
        if (this.tokenContent) {
            this.#tokenContent.role = [...role];
            this.#updateToken();
        }
        return this;
    }

    /**
     *	Set user id for active session
     *	@param	{string}	_id 	user id
     **/
    setUserId(_id) {
        if (this.tokenContent) {
            this.#tokenContent._id = _id;
            this.#updateToken();
        }
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

    static test(req) {
        return !!this.getTokenFromRequest(req);
    }
};

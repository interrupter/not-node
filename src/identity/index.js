const Identity = require("./identity");
const { getIP } = require("../common");

module.exports = class notAppIdentity {
    static #identity = Identity;

    static set identity(val) {
        this.#identity = val;
    }

    static get identity() {
        return this.#identity;
    }

    static identityToAuthData(identity, req) {
        return {
            root: identity.isRoot(),
            admin: identity.isAdmin(),
            auth: identity.isUser(),
            role: identity.getRole(),
            primaryRole: identity.getPrimaryRole(),
            uid: identity.getUserId(),
            sid: identity.getSessionId(),
            ip: req ? getIP(req) : undefined,
            provider: identity.constructor.name,
        };
    }

    /**
     *  Collects various authentification and authorization data from request object
     *  @param {import('../types').notNodeExpressRequest}  req       ExpressRequest
     *  @return {import('../types').notAppIdentityData}  various authentification data for actor { root:boolean, auth: boolean, role: [string], uid: ObjectId, sid: string, ip:string }
     */
    static extractAuthData(req) {
        const identity = this.#identity.of(req);
        return this.identityToAuthData(identity, req);
    }

    /**
     *
     * @param    {import('../types').notNodeExpressRequest}     req
     */
    constructor(req) {
        return notAppIdentity.identity.of(req);
    }
};

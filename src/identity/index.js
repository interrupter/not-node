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

    /**
     *  Collects various authentification and authorization data from request object
     *  @param {import('../types').notNodeExpressRequest}  req       ExpressRequest
     *  @return {object}  various authentification data for actor { root:boolean, auth: boolean, role: [string], uid: ObjectId, sid: string, ip:string }
     */
    static extractAuthData(req) {
        const identity = this.#identity.of(req);
        return {
            root: identity.isRoot(),
            admin: identity.isAdmin(),
            auth: identity.isUser(),
            role: identity.getRole(),
            primaryRole: identity.getPrimaryRole(),
            uid: identity.getUserId(),
            sid: identity.getSessionId(),
            ip: getIP(req),
        };
    }

    /**
     *
     * @param    {import('../types').notNodeExpressRequest}     req
     */
    constructor(req) {
        return notAppIdentity.identity.of(req);
    }
};

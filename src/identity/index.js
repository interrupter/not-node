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
     *  @params {object}  req       ExpressRequest
     * @return {object}  various authentification data for actor { root:boolean, auth: boolean, role: [string], uid: ObjectId, sid: string, ip:string }
     */
    static extractAuthData(req) {
        const identity = this.#identity.of(req);
        return {
            root: identity.isRoot(),
            auth: identity.isUser(),
            role: identity.getRole(),
            uid: identity.getUserId(),
            sid: identity.getSessionId(),
            ip: getIP(req),
        };
    }

    constructor(req) {
        return notAppIdentity.identity.of(req);
    }
};

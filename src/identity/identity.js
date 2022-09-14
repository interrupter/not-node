const { copyObj, objHas } = require("../common");
const IdentityProviderSession = require("./providers/session");
const IdentityProviderToken = require("./providers/token");
const { IdentityExceptionProviderAlreadySet } = require("./exceptions");

/**
 * Class to manage and access to user identity providers and their options
 */
class Identity {
    static #providersOptions = {};

    static #providers = {
        session: IdentityProviderSession,
        token: IdentityProviderToken,
    };

    static of(req) {
        const Provider = this.providerSelector(req);
        return new Provider(req, this.#getProviderOptions(req) ?? {});
    }

    static providerSelector(req) {
        return this.#providers[this.getProviderName(req)];
    }

    // override if needed
    static getProviderName(req) {
        return req.session ? "session" : "token";
    }

    static #getProviderOptions(req) {
        return copyObj(this.#providersOptions[this.getProviderName(req)] ?? {});
    }

    static setProviderOptions(providerName, options) {
        if (options && typeof options !== "undefined") {
            this.#providersOptions[providerName] = copyObj(options);
        }
    }

    static setProvider(providerName, Provider) {
        if (objHas(this.#providers, providerName)) {
            throw new IdentityExceptionProviderAlreadySet(providerName);
        }
        this.#providers[providerName] = Provider;
    }
}

module.exports = Identity;

const { copyObj, objHas } = require("../common");
const IdentityProviderSession = require("./providers/session");
const IdentityProviderToken = require("./providers/token");
const {
    IdentityExceptionProviderAlreadySet,
    IdentityExceptionProviderNotFound,
} = require("./exceptions");

/**
 * Class to manage and access to user identity providers and their options
 */
class Identity {
    static #priorities = ["token", "session"];

    static #providers = {
        session: IdentityProviderSession,
        token: IdentityProviderToken,
    };

    static of(req) {
        const Provider = this.providerSelector(req);
        return new Provider(req);
    }

    static providerSelector(req) {
        return this.getProvider(this.getProviderName(req));
    }

    static getProvider(providerName) {
        return this.#providers[providerName];
    }

    // override if needed
    static getProviderName(req) {
        for (let providerName of this.#priorities) {
            if (this.getProvider(providerName).test(req)) {
                console.log("identity provider type", providerName);
                return providerName;
            }
        }
        throw new IdentityExceptionProviderNotFound();
    }

    static setProviderOptions(providerName, options) {
        if (options && typeof options !== "undefined") {
            this.#providers[providerName].setOptions(copyObj(options));
        }
    }

    static setProvider(providerName, Provider) {
        if (objHas(this.#providers, providerName)) {
            throw new IdentityExceptionProviderAlreadySet(providerName);
        }
        this.#providers[providerName] = Provider;
    }

    static setProvidersPriorities(list = []) {
        this.#priorities = [...list];
    }
}

module.exports = Identity;

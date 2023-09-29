const {
    DEFAULT_USER_ROLE_FOR_ROOT,
    DEFAULT_USER_ROLE_FOR_ADMIN,
    DEFAULT_USER_ROLE_FOR_GUEST,
} = require("../auth/const");
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

    static #primaryRoles = [
        DEFAULT_USER_ROLE_FOR_ROOT,
        DEFAULT_USER_ROLE_FOR_ADMIN,
        DEFAULT_USER_ROLE_FOR_GUEST,
    ];
    static #secondaryRoles = [];

    static setPrimaryRoles(list = []) {
        this.#primaryRoles = [...list];
        Object.keys(this.#providers).forEach((itm) => {
            this.#providers[itm].setPrimaryRoles([...list]);
        });
        return this;
    }

    static setSecondaryRoles(list = []) {
        this.#secondaryRoles = [...list];
        Object.keys(this.#providers).forEach((itm) => {
            this.#providers[itm].setSecondaryRoles([...list]);
        });
        return this;
    }

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

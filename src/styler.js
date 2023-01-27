const DEFAULT_STYLER = () => {
    return {};
};

module.exports = class notStyler {
    static #stylers = {};
    static #defaultStyler = DEFAULT_STYLER;

    static get(stylerName) {
        if (Object.hasOwn(this.#stylers, stylerName)) {
            return this.#stylers[stylerName];
        } else {
            return this.#defaultStyler;
        }
    }

    static set(stylerName, func) {
        this.#stylers[stylerName] = func;
        return this;
    }

    static setDefault(func) {
        this.#defaultStyler = func;
        return this;
    }

    static resetDefault() {
        this.#defaultStyler = DEFAULT_STYLER;
        return this;
    }
};

const DEFAULT_STYLER = () => {
    return {};
};

module.exports = class notStyler {
    static #stylers = {};
    static #defaultStyler = DEFAULT_STYLER;

    static get(stylerName) {
        if (
            typeof stylerName !== "undefined" &&
            Object.hasOwn(this.#stylers, stylerName)
        ) {
            return this.#stylers[stylerName];
        } else {
            return this.#defaultStyler;
        }
    }

    static set(stylerName, func) {
        if (typeof stylerName === "string") {
            this.#stylers[stylerName] = func;
        } else {
            throw new Error("Styler name should be a string");
        }
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

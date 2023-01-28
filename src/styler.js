const DEFAULT_STYLER = () => {
    return {};
};

module.exports = class notStyler {
    #stylers = {};
    #defaultStyler = DEFAULT_STYLER;

    constructor(defaultStyler = DEFAULT_STYLER) {
        this.setDefault(defaultStyler);
    }

    get(stylerName) {
        if (
            typeof stylerName !== "undefined" &&
            Object.hasOwn(this.#stylers, stylerName)
        ) {
            return this.#stylers[stylerName];
        } else {
            return this.#defaultStyler;
        }
    }

    set(stylerName, func) {
        if (typeof stylerName === "string") {
            this.#stylers[stylerName] = func;
        } else {
            throw new Error("Styler name should be a string");
        }
        return this;
    }

    setDefault(func) {
        this.#defaultStyler = func;
        return this;
    }

    resetDefault() {
        this.#defaultStyler = DEFAULT_STYLER;
        return this;
    }
};

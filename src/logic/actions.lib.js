class ActionsSetsLibrary {
    #lib = new Map();

    add(name, set) {
        if (!this.#lib.has(name)) {
            this.#lib.set(name, set);
        }
    }

    get(name) {
        if (this.#lib.has(name)) {
            return this.#lib.get(name);
        }
        return {};
    }

    has(name){
        return this.#lib.has(name);
    }
}

module.exports = ActionsSetsLibrary;

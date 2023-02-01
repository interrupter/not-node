class Logger {
    #silent = true;

    log() {
        !this.#silent && console.log(...arguments);
    }

    error() {
        !this.#silent && console.error(...arguments);
    }

    debug() {
        !this.#silent && console.debug(...arguments);
    }

    info() {
        !this.#silent && console.info(...arguments);
    }

    setSilent(val) {
        this.#silent = val;
    }
}

export default new Logger();

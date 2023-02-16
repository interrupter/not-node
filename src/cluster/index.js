const { log } = require("not-log")(module, "notCluster");
const notClusterRedis = require("./cluster.redis.js");

module.exports = class notCluster {
    static #provider = notClusterRedis;

    static setProvider(newProvider) {
        log(
            `Setting new cluster messaging provider: ${newProvider.prototype.constructor.name}`
        );
        this.#provider = newProvider;
    }

    static on() {
        return this.#provider.on(...arguments);
    }

    static off() {
        return this.#provider.off(...arguments);
    }

    static emit() {
        return this.#provider.emit(...arguments);
    }
};

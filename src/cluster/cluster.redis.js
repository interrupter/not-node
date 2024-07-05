const notEnv = require("../env.js");
const notCommon = require("../common");
const { error } = require("not-log")(module, "ClusterRedis");

/**
 * Cluster event bus driver upon Redis events
 */
module.exports = class notClusterRedisProvider {
    static #clientGetter = null;
    static #clientName = "db.redis";
    static #subscriber = null;
    static #publisher = null;

    static async setClientName(name) {
        try {
            this.#clientName = name;
            await this.#resetClient();
        } catch (e) {
            error(e);
        }
    }

    static async setClientGetter(getter) {
        try {
            this.#clientGetter = getter;
            await this.#resetClient();
        } catch (e) {
            error(e);
        }
    }

    static async #resetClient() {
        try {
            if (this.#publisher) {
                await this.#publisher.disconnect();
                this.#publisher = null;
            }
            if (this.#subscriber) {
                await this.#subscriber.disconnect();
                this.#subscriber = null;
            }
        } catch (e) {
            error(e);
        }
    }

    static #getClient() {
        try {
            if (this.#clientGetter) {
                return this.#clientGetter();
            } else {
                return notEnv.get(this.#clientName);
            }
        } catch (e) {
            error(e);
        }
    }

    static async #getPublisher() {
        try {
            if (!this.#publisher) {
                this.#publisher = this.#getClient().duplicate();
                await this.#publisher.connect();
            }
            return this.#publisher;
        } catch (e) {
            error(e);
        }
    }

    static async #getSubscriber() {
        try {
            if (!this.#subscriber) {
                this.#subscriber = this.#getClient().duplicate();
                await this.#subscriber.connect();
            }
            return this.#subscriber;
        } catch (e) {
            error(e);
        }
    }

    static #createListener(func) {
        return async (message) => {
            try {
                await notCommon.executeFunctionAsAsync(func, [
                    JSON.parse(message),
                ]);
            } catch (e) {
                error(e);
            }
        };
    }

    static async on(eventName, func) {
        try {
            const listener = this.#createListener(func);
            const subscriber = await this.#getSubscriber();
            await subscriber.subscribe(eventName, listener);
            return listener;
        } catch (e) {
            error(e);
        }
    }

    static async off(eventName, listener) {
        try {
            const subscriber = await this.#getSubscriber();
            return subscriber.unsubscribe(eventName, listener);
        } catch (e) {
            error(e);
        }
    }

    static async emit(eventName, message) {
        try {
            const publisher = await this.#getPublisher();
            return publisher.publish(eventName, JSON.stringify(message));
        } catch (e) {
            error(e);
        }
    }
};

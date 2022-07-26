const log = require("not-log")(module, "not-node//init//redlock");
const { default: Redlock, ResourceLockedError } = require("redlock");
const { notError } = require("not-error");

const DEFAULT_CONFIG = {
    driftFactor: 0.01, // multiplied by lock ttl to determine drift time
    retryCount: 10,
    retryDelay: 200, // time in ms
    retryJitter: 200, // time in ms
    automaticExtensionThreshold: 500, // time in ms
};

module.exports = class InitDBRedlock {
    static async initLocker({ master, alias, redisClientAlias, config }) {
        log.info("Setting up ioredis locker...");
        const redisClient = master.getEnv(`db.${redisClientAlias}`);
        const redlockConfig = config.get(`db.${alias}`);
        const redlock = new Redlock(
            [redisClient],
            redlockConfig || DEFAULT_CONFIG
        );
        redlock.on("error", (error) => {
            // Ignore cases where a resource is explicitly marked as locked on a client.
            if (error instanceof ResourceLockedError) {
                return;
            }
            // Log all other errors.
            log.error(error);
            master.getApp().report(new notError("Redlock failed", {}, error));
        });
        master.setEnv(`db.${alias}`, redlock);
    }

    async run({ master, config, emit, options }) {
        await emit("redlock.pre", { config, options, master });
        await InitDBRedlock.initLocker({
            config,
            master,
            alias: "redlock",
            redisClientAlias: "ioredis",
        });
        await emit("redlock.post", { config, options, master });
    }
};

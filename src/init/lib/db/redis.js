const { notError } = require("not-error");
const log = require("not-log")(module, "not-node//init//db//redis");

module.exports = class InitDBRedis {
    static async initRedis({ conf, master, alias }) {
        log.info("Setting up redis connection...");
        const redis = require("redis");
        const redisClient = redis.createClient(conf);
        InitDBRedis.bindClientEvents({ master, redisClient });
        master.setEnv(`db.${alias}`, redisClient);
    }

    async run({ config, options, master, conf, alias, emit }) {
        await emit(`db.${alias}.pre`, {
            config,
            options,
            master,
            conf,
            alias,
        });
        await InitDBRedis.initRedis({ conf, master, alias });
        await emit(`db.${alias}.post`, {
            config,
            options,
            master,
            conf,
            alias,
        });
    }

    static bindClientEvents({ redisClient, master }) {
        redisClient.on("error", (err) => {
            log.error("Redis client error: ", err);
            master
                .getApp()
                .report(new notError("Redis connection failed", {}, err));
        });

        redisClient.on("warning", (err) => {
            log.error("Redis client warning: ", err);
        });

        redisClient.on("connect", function () {
            log.info("Redis client connected to DB");
        });

        redisClient.on("ready", function () {
            log.info("Redis client ready");
        });

        redisClient.on("reconnecting", function () {
            log.info("Redis client reconnecting");
        });

        redisClient.on("end", function () {
            log.info("Redis client closed connection");
        });
    }
};

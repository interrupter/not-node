const log = require("not-log")(module, "not-node//init//db//ioredis");

module.exports = class InitDBRedisIO {
    static async initRedis({ conf, master, alias }) {
        log.info("Setting up ioredis connection...");
        const Redis = require("ioredis");
        const redisClient = new Redis(conf);
        redisClient.on("error", log.error);
        master.setEnv(`db.${alias}`, redisClient);
        log.log("redis client");
    }

    async run({ config, options, master, conf, alias, emit }) {
        await emit(`db.${alias}.pre`, {
            config,
            options,
            master,
            conf,
            alias,
        });
        await InitDBRedisIO.initRedis({ conf, master, alias });
        await emit(`db.${alias}.post`, {
            config,
            options,
            master,
            conf,
            alias,
        });
    }
};

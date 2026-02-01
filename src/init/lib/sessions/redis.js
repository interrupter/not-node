const log = require("not-log")(module, "not-node//init//sessions//ioredis");

const DEFAULT_CLIENT = "ioredis";

module.exports = class InitSessionsRedis {
    async run({ config, options, master, emit }) {
        log?.info("Setting up user sessions handler(redis)...");
        await emit("sessions.pre", { config, options, master });
        const expressSession = require("express-session");
        const storeClient = config.get("session.client", DEFAULT_CLIENT);
        const redisClient = master.getEnv(`db.${storeClient}`);
        const { RedisStore } = require("connect-redis");
        master.getServer().use(
            expressSession({
                secret: config.get("session.secret"),
                name: config.get("session.key"),
                cookie: config.get("session.cookie"),
                resave: false,
                saveUninitialized: true,
                store: new RedisStore({
                    client: redisClient,
                    ttl: options?.ttl || 86400,
                }),
            })
        );
        await emit("sessions.post", { config, options, master });
    }
};

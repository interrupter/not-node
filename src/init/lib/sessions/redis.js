const log = require("not-log")(module, "not-node//init//sessions//ioredis");

const DEFAULT_CLIENT = "ioredis";

module.exports = class InitSessionsRedis {
    async run({ config, options, master, emit }) {
        log.info("Setting up user sessions handler(redis)...");
        await emit("sessions.pre", { config, options, master });
        const expressSession = require("express-session");
        const storeClient = config.get("session.client", DEFAULT_CLIENT);
        const redisClient = master.getEnv(`db.${storeClient}`);
        const redisStore = require("connect-redis")(expressSession);
        master.getServer().use(
            expressSession({
                secret: config.get("session.secret"),
                key: config.get("session.key"),
                cookie: config.get("session.cookie"),
                resave: false,
                saveUninitialized: true,
                store: new redisStore({
                    host: "localhost",
                    port: 6379,
                    client: redisClient,
                    ttl: 86400,
                }),
            })
        );
        await emit("sessions.post", { config, options, master });
    }
};

const log = require("not-log")(module, "RateLimiter");
const { partCopyObj } = require("../../common");
const notEnv = require("../../env");
const { RateLimiterRedis } = require("rate-limiter-flexible");

const DEFAULT_OPTIONS = {
    keyPrefix: "rateLimiterMiddleware",
    points: 20,
    duration: 1,
};

const DEFAULT_CLIENT = "ioredis";

module.exports = class InitRateLimiter {
    static get DEFAULT_CLIENT() {
        return DEFAULT_CLIENT;
    }

    static createMiddleware({ rateLimiter }) {
        return (req, res, next) => {
            rateLimiter
                .consume(req.ip)
                .then(() => next())
                .catch(() => {
                    log?.error("Too many requests by " + req.ip);
                    res.status(429).send("Too Many Requests");
                });
        };
    }

    async run({ config, master, emit }) {
        await emit("rateLimiter.pre", { config, master });
        const rateLimiter = InitRateLimiter.createRateLimiter({
            config,
        });
        const middleware = InitRateLimiter.createMiddleware({ rateLimiter });
        master.getServer().use(middleware);
        await emit("rateLimiter.post", { config, master });
    }

    static getOptions({ config }) {
        const opts = partCopyObj(
            config.get("modules.rateLimiter", {}),
            Object.keys(DEFAULT_OPTIONS)
        );
        return {
            ...DEFAULT_OPTIONS,
            ...opts,
        };
    }

    static createRateLimiter({ config }) {
        const storeClient = InitRateLimiter.getClient(
            InitRateLimiter.getClientName({ config })
        );
        return new RateLimiterRedis({
            storeClient,
            ...InitRateLimiter.getOptions({ config }),
        });
    }

    /**
     *  Returns redis client name in "db.*" of notEnv
     *
     * @static
     * @param {object}  params={ config }
     * @return {string}
     */
    static getClientName({ config }) {
        return config.get("modules.rateLimiter.client", DEFAULT_CLIENT);
    }

    static getClient(storeClient) {
        return notEnv.get(`db.${storeClient}`);
    }

    static initCustom(
        options = {
            keyPrefix: "rateLimiterCustom",
            points: 20,
            duration: 1,
        },
        storeName = DEFAULT_CLIENT
    ) {
        const storeClient = InitRateLimiter.getClient(storeName);
        return new RateLimiterRedis({
            storeClient,
            ...options,
        });
    }
};

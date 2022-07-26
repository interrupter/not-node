const log = require("not-log")(module, "not-node//init//cors");

module.exports = class InitCORS {
    static getOriginFilter(whitelist) {
        return (origin, callback) => {
            callback(null, whitelist.includes(origin));
        };
    }

    async run({ config, options, master, emit }) {
        await emit("cors.pre", { config, options, master });
        const cors = require("cors");
        log.info("Setting up CORS rules...");
        const whitelist = config.get("cors");
        log.info("Whitelist: ", whitelist.join(", "));
        let corsOptions = {
            origin: InitCORS.getOriginFilter(whitelist),
            credentials: true,
        };
        log.info("CORS options", corsOptions);
        master.getServer().use(cors(corsOptions));
        await emit("cors.post", { config, options, master });
    }
};

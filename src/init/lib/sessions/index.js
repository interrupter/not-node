module.exports = class InitSessions {
    /**
     * Returns constructor of Session driver
     * @param {Object} conf  configuration os session from application config
     * @param {string} conf.driver  name of session storage engine
     * @return {Object}          class constructor or undefined
     **/
    static getConstructor(conf) {
        switch (conf.driver) {
            case "redis":
                return require("./redis.js");
            case "mongoose":
                return require("./mongoose.js");
            default:
                return require("./mongoose.js");
        }
    }

    async run({ master, config, options, emit }) {
        const conf = config.get("session");
        const Constructor = InitSessions.getConstructor(conf);
        await new Constructor().run({ master, config, options, conf, emit });
    }
};

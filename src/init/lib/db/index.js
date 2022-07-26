const path = require("path");
const { objHas } = require("../../../common");

module.exports = class InitDB {
    static default = path.resolve(__dirname, "./mongoose.js");

    static drivers = {
        ioredis: path.resolve(__dirname, "./ioredis.js"),
        redis: path.resolve(__dirname, "./redis.js"),
        mongoose: path.resolve(__dirname, "./mongoose.js"),
    };

    /**
     * Returns constructor of DB driver
     * @param {string} driver  name of db engine
     * @return {Object}          class constructor or undefined
     **/
    static getConstructor(driver) {
        if (objHas(InitDB.drivers, driver)) {
            return require(InitDB.drivers[driver]);
        } else {
            return require(InitDB.default);
        }
    }

    /**
     *  db = {
     *  [db_driver_name_1]: options,
     *  [db_driver_name_2]: options,
     * }
     * to get driver require('not-node').getEnv(db_driver_name_2)
     * require('not-node').getEnv('mongoose')
     * require('not-node').getEnv('redis')
     **/
    async run({ master, config, options, emit }) {
        const conf = config.get("db");
        for (let driver in conf) {
            const Constructor = InitDB.getConstructor(driver);
            await new Constructor().run({
                master,
                config,
                options,
                conf: conf[driver],
                alias: driver,
                emit,
            });
        }
    }
};

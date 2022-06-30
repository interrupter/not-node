const log = require("not-log")(module, "not-node//init");
const ADDS = require("../additional");

module.exports = class InitDBMongoose {
    static fixMongooseOptions(opts) {
        let options = JSON.parse(JSON.stringify(opts));
        delete options.host;
        delete options.db;
        return options;
    }

    static async initMongoose({ conf, master, alias }) {
        const Increment = require("../../model/increment.js");
        log.info("Setting up mongoose connection...");
        const mongoose = require("mongoose");
        mongoose.Promise = global.Promise;
        await mongoose.connect(
            conf.uri,
            InitDBMongoose.fixMongooseOptions(conf.options)
        );
        log.info("Mongoose connected...");
        if (conf.increment !== false) {
            Increment.init(mongoose);
        }
        master.setMongoose(mongoose);
        master.setEnv(`db.${alias}`, mongoose);
    }

    async run({ config, options, master, conf, alias }) {
        log.info(`db.${alias}.pre`);
        await ADDS.run(`db.${alias}.pre`, {
            config,
            options,
            master,
            conf,
            alias,
        });
        await InitDBMongoose.initMongoose({ conf, master, alias });
        await ADDS.run(`db.${alias}.post`, {
            config,
            options,
            master,
            conf,
            alias,
        });
    }
};

const { notError } = require("not-error");
const log = require("not-log")(module, "not-node//init//sessions//mongoose");

module.exports = class InitSessionsMongo {
    static createStore({ config, master, expressSession }) {
        const MongoDBStore = require("connect-mongodb-session")(expressSession);
        const mongooseOptions = config.get("db.mongoose.options");
        let store = new MongoDBStore({
            uri: `mongodb://${mongooseOptions.user}:${mongooseOptions.pass}@${mongooseOptions.host}/${mongooseOptions.db}`,
            databaseName: mongooseOptions.db,
            collection: "sessions",
        });
        store.on("connected", function () {
            log.info("Sessions connected");
        });
        // Catch errors
        store.on("error", function (error) {
            master
                .getApp()
                .report(
                    new notError(
                        "User sessions storage connection failed",
                        {},
                        error
                    )
                );
        });
        return store;
    }

    async run({ config, options, master, emit }) {
        const expressSession = require("express-session");
        log.info("Setting up user sessions handler(mongoose)...");
        await emit("sessions.pre", { config, options, master });
        master.getServer().use(
            expressSession({
                secret: config.get("session:secret"),
                key: config.get("session:key"),
                cookie: config.get("session:cookie"),
                resave: true,
                saveUninitialized: true,
                store: InitSessionsMongo.createStore({
                    config,
                    master,
                    expressSession,
                }),
            })
        );
        await emit("sessions.post", { config, options, master });
    }
};

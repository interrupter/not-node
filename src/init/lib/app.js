const notAppConstructor = require("../../app.js");
const ENV = process.env.NODE_ENV || "development";
const path = require("path");
const logger = require("not-log");
const log = logger(module, "not-node//init//app");
const { notErrorReporter } = require("not-error");

module.exports = class InitApp {
    static AppConstructor = notAppConstructor;
    static ReporterConstructor = notErrorReporter;

    static async createApp({ config, options, master, emit }) {
        await emit("app.create.pre", { config, options, master });
        master.setApp(
            new InitApp.AppConstructor({ mongoose: master.getMongoose() })
        );
        await emit("app.create.post", { config, options, master });
    }

    static async setAppEnvs({ config, options, master, emit }) {
        await emit("app.setEnv.pre", { config, options, master });
        master.setEnv("hostname", config.get("hostname"));
        master.setEnv("server", `https://` + config.get("host"));
        master.setEnv("appPath", config.get("appPath"));
        master.setEnv("name", master.getManifest().name);
        master.setEnv("fullServerName", config.get("fullServerName"));
        master.setEnv("dbDumpsPath", config.get("dbDumpsPath"));
        master.setEnv(
            "rolesPriority",
            master.getManifest().targets.server.roles
        );
        master.getApp().ENV = ENV;
        await emit("app.setEnv.post", { config, options, master });
    }

    static async initCore({ config, options, master, emit }) {
        await emit("app.initCore.pre", { config, options, master });
        master.getApp().importModuleFrom(path.join(__dirname, "../core"));
        await emit("app.initCore.post", { config, options, master });
    }

    static async importModules({ config, options, master, emit }) {
        await emit("app.importModules.pre", { config, options, master });
        master.getApp().importModulesFrom(config.get("modulesPath"));
        if (Array.isArray(config.get("importModulesFromNPM"))) {
            config.get("importModulesFromNPM").forEach((modName) => {
                master
                    .getApp()
                    .importModuleFrom(
                        path.join(config.get("npmPath"), modName),
                        modName
                    );
            });
        }
        await emit("app.importModules.post", { config, options, master });
    }

    static async createReporter({ config, /* options,*/ master }) {
        try {
            master.getApp().reporter = new InitApp.ReporterConstructor({
                origin: {
                    server: config.get("host"),
                },
            });
            master.getApp().logger = logger(module, "notApplication");
        } catch (e) {
            log.error(e);
        }
    }

    async run({ config, options, master, emit }) {
        try {
            log.info("Init not-app...");
            await emit("app.pre", { config, options, master });
            await InitApp.createApp({ config, options, master, emit });
            await InitApp.setAppEnvs({ config, options, master, emit });
            await InitApp.initCore({ config, options, master, emit });
            await InitApp.importModules({ config, options, master, emit });
            await InitApp.createReporter({ config, options, master, emit });
            await emit("app.post", { config, options, master });
        } catch (e) {
            master.throwError(e.message, 1);
        }
    }
};

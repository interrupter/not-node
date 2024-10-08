const notAppConstructor = require("../../app.js");
const ENV = process.env.NODE_ENV || "development";
const path = require("path");
const logger = require("not-log");
const log = logger(module, "not-node//init//app");
const { notErrorReporter } = require("not-error/src/index.cjs");

const notAppPostponedFieldsRegistrator = require("../../manifest/registrator/fields.postponed.js");

const CONST_CORE_PATH = path.join(__dirname, "../../core");

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
        master.setEnv("name", master.getManifest().name);
        master.setEnv(
            "rolesPriority",
            master.getManifest().targets.server.roles
        );
        master.getApp().ENV = ENV;
        await emit("app.setEnv.post", { config, options, master });
    }

    static async initCore({ config, options, master, emit }) {
        await emit("app.initCore.pre", { config, options, master });
        master.getApp().importModuleFrom(CONST_CORE_PATH);
        await emit("app.initCore.post", { config, options, master });
    }

    static async importModules({ config, options, master, emit }) {
        await emit("app.importModules.pre", { config, options, master });
        master.getApp().importModulesFrom(master.getEnv("modulesPath"));
        if (Array.isArray(config.get("importModulesFromNPM"))) {
            config.get("importModulesFromNPM").forEach((modName) => {
                const modPath = path.join(master.getEnv("npmPath"), modName);
                master.getApp().importModuleFrom(modPath, modName);
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
            log?.error(e);
        }
    }

    async run({ config, options, master, emit }) {
        try {
            log?.info("Init not-app...");
            await emit("app.pre", { config, options, master });
            await InitApp.createApp({ config, options, master, emit });
            await InitApp.setAppEnvs({ config, options, master, emit });
            await InitApp.initCore({ config, options, master, emit });
            await InitApp.importModules({ config, options, master, emit });
            await InitApp.createReporter({ config, master });
            this.printReportByPostponedFieldsRegistrator();
            await emit("app.post", { config, options, master });
        } catch (e) {
            log?.error(e);
        }
    }

    printReportByPostponedFieldsRegistrator() {
        const report = notAppPostponedFieldsRegistrator.state();
        if (Object.keys(report.unresolved).length) {
            log?.error(report.unresolved);
        }
        if (report.insecure.length) {
            log?.error(`List of insecure fields (${report.insecure.length}): `, report.insecure.join(', '));
        }
    }
};

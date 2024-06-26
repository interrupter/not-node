const log = require("not-log")(module, "not-node//init//env");
const { tryDirAsync } = require("../../common");

module.exports = class InitENV {
    static getProxyPort(config) {
        return parseInt(config.get("proxy:port") || config.get("port"));
    }

    static getFullServerName(config) {
        let name = "";
        if (config.get("proxy:secure") === true) {
            name = "https://";
        } else {
            name = "http://";
        }
        name += config.get("host");
        let proxyPort = InitENV.getProxyPort(config);
        if (proxyPort !== 80) {
            name += ":" + proxyPort;
        }
        return name;
    }

    static async checkPaths(master, config) {
        const paths = config.get("path");
        if (paths) {
            for (let pathName of Object.keys(paths)) {
                if (await tryDirAsync(paths[pathName])) {
                    log?.error(
                        `config path (${pathName}) not exists: ${paths[pathName]}`
                    );
                }
            }
        }
    }

    async run({ config, options, master, emit }) {
        log?.info("Setting up server environment variables...");
        await emit("env.pre", { config, options, master });
        config.set(
            "staticPath",
            master.getAbsolutePath(config.get("path:static") || "static")
        );
        config.set(
            "modulesPath",
            master.getAbsolutePath(config.get("path:modules") || "modules")
        );
        config.set(
            "dbDumpsPath",
            master.getAbsolutePath(
                config.get("path:dbDumps") || "../../db.dumps"
            )
        );
        config.set("appPath", options.pathToApp);
        config.set("npmPath", options.pathToNPM);
        config.set("fullServerName", InitENV.getFullServerName(config));
        if (config.get("path:ws")) {
            log?.log("wsPath", master.getAbsolutePath(config.get("path:ws")));
            config.set("wsPath", master.getAbsolutePath(config.get("path:ws")));
        }
        await InitENV.checkPaths(master, config);
        await emit("env.post", { config, options, master });
    }
};

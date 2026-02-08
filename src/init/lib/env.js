const log = require("not-log")(module, "not-node//init//env");
const { tryDirAsync } = require("../../common");

const {
    DEFAULT_PATH_WS,
    DEFAULT_PATH_MODULES,
    DEFAULT_PATH_STATIC,
    DEFAULT_PATH_TMP,
    DEFAULT_PATH_DB_DUMPS,
} = require("../../const");

module.exports = class InitENV {
    static CONFIG_SET = [
        {
            from: "path:static",
            to: "staticPath",
            def: DEFAULT_PATH_STATIC,
        },
        {
            from: "path:modules",
            to: "modulesPath",
            def: DEFAULT_PATH_MODULES,
        },
        {
            from: "path:tmp",
            to: "tmpPath",
            def: DEFAULT_PATH_TMP,
        },
        {
            from: "path:dbDumps",
            to: "dbDumpsPath",
            def: DEFAULT_PATH_DB_DUMPS,
        },
        {
            from: "path:ws",
            to: "wsPath",
            def: DEFAULT_PATH_WS,
        },
    ];

    static getProxyPort(config) {
        return parseInt(config.get("proxy:port") || config.get("port"));
    }

    static getFullServerName(config) {
        let name;
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
            log?.log("Paths existence check");
            for (let pathName of Object.keys(paths)) {
                const absolutePath = master.getEnv(`${pathName}Path`);
                if (absolutePath) {
                    if (!(await tryDirAsync(absolutePath))) {
                        log?.error(
                            `config path (${pathName}) not exists: ${paths[pathName]} - ${absolutePath}`
                        );
                    } else {
                        log?.log(
                            `config path (${pathName}) exists: ${paths[pathName]} - ${absolutePath}`
                        );
                    }
                }
            }
        }
    }

    static addToEnv(master, key, val) {
        master.setEnv(key, val);
        return val;
    }

    static setObsoleteAndNew({ config, master, from, to, def }) {
        config.set(
            to,
            InitENV.addToEnv(
                master,
                to,
                master.getAbsolutePath(config.get(from, def))
            ),
            `obsolete: use notEnv.get('${to}') instead`
        );
    }

    static initFromTemplate({ config, master }) {
        InitENV.CONFIG_SET.forEach((item) => {
            InitENV.setObsoleteAndNew({
                config,
                master,
                ...item,
            });
        });
    }

    async run({ config, options, master, emit }) {
        log?.info("Setting up server environment variables...");
        await emit("env.pre", { config, options, master });

        master.setEnv("validationEnv", options.validationEnv);
        master.setEnv("hostname", config.get("hostname"));
        master.setEnv("server", `https://` + config.get("host"));

        InitENV.initFromTemplate({ config, master });

        config.set(
            "appPath",
            InitENV.addToEnv(master, "appPath", options.pathToApp),
            "obsolete: use notEnv.get('appPath')"
        );

        config.set(
            "npmPath",
            InitENV.addToEnv(master, "npmPath", options.pathToNPM),
            "obsolete: use notEnv.get('npmPath')"
        );

        config.set(
            "fullServerName",
            InitENV.addToEnv(
                master,
                "fullServerName",
                InitENV.getFullServerName(config)
            ),
            "obsolete: use notEnv.get('fullServerName')"
        );

        await InitENV.checkPaths(master, config);
        await emit("env.post", { config, options, master });
    }
};

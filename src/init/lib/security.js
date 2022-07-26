const Log = require("not-log")(module, "not-node//init//security");

module.exports = class InitSecurity {
    getCSPDirectives({ config }) {
        try {
            let corsArr = config.get("cors");
            let corsLine = corsArr ? corsArr.join(" ") : "";
            let CSPDirectives = config.get("CSP");
            let result = {};
            Object.keys(CSPDirectives).forEach((nm) => {
                result[nm + "Src"] = CSPDirectives[nm].join(" ");
                if (["default", "connect"].includes(nm)) {
                    result[nm + "Src"] += " " + corsLine;
                }
            });
            return result;
        } catch (e) {
            Log.error(e);
            return {};
        }
    }

    async run({ master, config, options }) {
        //adding protection
        const helmet = require("helmet");
        const CSPDirectives = this.getCSPDirectives({
            options,
            config,
            master,
        });
        master.getServer().use(
            helmet({
                contentSecurityPolicy: {
                    directives: {
                        ...CSPDirectives,
                        upgradeInsecureRequests: [],
                    },
                },
            })
        );
    }
};

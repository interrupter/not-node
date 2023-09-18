const Log = require("not-log")(module, "not-node//init//security");

module.exports = class InitSecurity {
    getCSPDirectives({ config }) {
        try {
            let corsArr = config.get("cors");
            let corsLine = corsArr ? corsArr.join(" ") : "";
            let CSPDirectives = config.get("CSP");
            let result = {};
            Object.keys(CSPDirectives).forEach((nm) => {
                result[nm] = [...CSPDirectives[nm]];
                if (
                    Array.isArray(corsArr) &&
                    ["default-src", "connect-src"].includes(nm)
                ) {
                    result[nm].push(...corsLine);
                }
            });
            return result;
        } catch (e) {
            Log && Log.error(e);
            return {};
        }
    }

    async run({ master, config }) {
        //adding protection
        const helmet = require("helmet");
        const CSPDirectives = this.getCSPDirectives({
            config,
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

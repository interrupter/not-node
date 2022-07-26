const log = require("not-log")(module, "not-node//init//http");
const fs = require("fs");

module.exports = class InitHTTP {
    listenPromise({ config, master }) {
        return new Promise((resolve, reject) => {
            master.getHTTPServer().listen(config.get("port"), (err) => {
                if (err) {
                    reject(err);
                }
                log.info(
                    "Server listening on port " +
                        config.get("port") +
                        "." +
                        (InitHTTP.isSecure({ config })
                            ? " For secure connections"
                            : "")
                );
                resolve();
            });
        });
    }

    static getSSLOptions({ config }) {
        return {
            key: fs.readFileSync(config.get("ssl:keys:private"), {
                encoding: "utf-8",
            }),
            cert: fs.readFileSync(config.get("ssl:keys:cert"), {
                encoding: "utf-8",
            }), //fullchain
            ca: fs.readFileSync(config.get("ssl:keys:chain"), {
                encoding: "utf-8",
            }),
        };
    }

    async runHTTPS({ config, master }) {
        log.info("Setting up HTTPS server...");
        const https = require("https");
        master.getServer().set("protocol", "https");
        master.setHTTPServer(
            https.createServer(
                InitHTTP.getSSLOptions({ config }),
                master.getServer()
            )
        );
        await this.listenPromise({ config, master });
    }

    async runHTTP({ config, master }) {
        log.info("Setting up HTTP server...");
        const http = require("http");
        master.getServer().set("protocol", "http");
        master.setHTTPServer(http.createServer(master.getServer()));
        await this.listenPromise({ config, master });
    }

    static isSecure({ config }) {
        return config.get("ssl:enabled") === true;
    }

    async run({ options, config, master, emit }) {
        await emit("http.pre", { options, config, master });
        if (InitHTTP.isSecure({ config })) {
            await this.runHTTPS({ options, config, master });
        } else {
            await this.runHTTP({ options, config, master });
        }
        await emit("http.post", { options, config, master });
    }
};

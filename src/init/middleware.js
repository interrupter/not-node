const log = require("not-log")(module, "not-node//init");
const ADDS = require("./additional");

module.exports = class InitMiddleware {
    async run({ config, options, master }) {
        log.info("Setting up middlewares...");
        await ADDS.run("middleware.pre", { config, options, master });
        const input = config.get("middleware");
        if (input) {
            for (let ware in input) {
                let warePath = input[ware].path || ware,
                    proc;
                if (require(warePath).getMiddleware) {
                    proc = require(warePath).getMiddleware(input[ware]);
                } else if (require(warePath).middleware) {
                    proc = require(warePath).middleware;
                } else {
                    proc = require(warePath);
                }
                if (typeof proc === "function") {
                    master.getServer().use(proc);
                }
            }
        }
        await ADDS.run("middleware.post", { config, options, master });
    }
};

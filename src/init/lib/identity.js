const log = require("not-log")(module, "not-node//init//identity");
const notAppIdentity = require("../../identity");

module.exports = class InitIdentity {
    async run({ config, options, master, emit }) {
        await emit("identity.pre", { config, options, master });

        log.info("Setting up user Identity roles...");

        const roles = config.get("modules.user.roles");
        if (roles) {
            notAppIdentity.identity
                .setPrimaryRoles(roles?.primary || [])
                .setSecondaryRoles(roles?.secondary || []);
        }

        await emit("identity.post", { config, options, master });
    }
};

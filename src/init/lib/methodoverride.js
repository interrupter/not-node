module.exports = class InitMethodOverride {
    async run({ /*options, config,*/ master }) {
        const methodOverride = require("method-override");
        master.getServer().use(methodOverride());
    }
};

const log = require("not-log")(module, "not-node//init//informer");

module.exports = class InitInformer {
    async run({ master }) {
        log.log("try to create informer");
        const { Inform } = require("not-inform");
        master.getApp().informer = new Inform();
    }
};

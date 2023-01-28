module.exports = class InitModules {
    async run({ master }) {
        await master.getApp().execInModules("initialize", master);
    }
};

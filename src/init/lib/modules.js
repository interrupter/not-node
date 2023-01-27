module.exports = class InitModules {
    async run({ master }) {
        master.getApp().execInModules("initialize", master);
        master.getApp().execInModules("registerPagesRoutes", master);
    }
};

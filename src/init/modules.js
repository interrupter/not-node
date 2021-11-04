module.exports = class InitModules{
  async run({master}) {
    master.getApp().execInModules('initialize');
  }
};

module.exports = class InitModules{
  static async run({master}) {
    master.getApp().execInModules('initialize');
  }
};

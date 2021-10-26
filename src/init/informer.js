const log = require('not-log')(module, 'not-node//init');

module.exports = class InitInformer{
  static run() {
    try {
      log.log('try to create informer');
      const {
        Inform
      } = require('not-inform');
      this.notApp.informer = new Inform();
    } catch (e) {
      this.throwError(e.message, 1);
    }
  }
};

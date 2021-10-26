const log = require('not-log')(module, 'not-node//init');

const initExpress = require('./express');
const initNotApp = require('./app');


module.exports = class InitServer{

  static async run({config, options, master}) {
    try {
      //init express
      await initExpress.run({config, options, master});
      //init notApp
      await initNotApp.run({config, options, master});
    } catch (e) {
      log.error(e);
      master.throwError(e.message, 1);
    }
  }

};

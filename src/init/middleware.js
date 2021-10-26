const log = require('not-log')(module, 'not-node//init');
const ADDS = require('./additional');

module.exports = class InitMiddleware{

  static async run({config, options, master}) {
    log.info('Setting up middlewares...');
    try {
      await ADDS.run('middleware.pre', {config, options, master});
      const input = config.get('middleware');
      if (input) {
        for (let ware in input) {
          if (ware) {
            let warePath = input[ware].path || ware,
              proc;
            if (require(warePath).getMiddleware) {
              proc = require(warePath).getMiddleware(input[ware]);
            } else if (require(warePath).middleware) {
              proc = require(warePath).middleware;
            } else {
              proc = require(warePath);
            }
            master.expressApp.use(proc);
          }
        }
      }
      await ADDS.run('middleware.post', {config, options, master});
    } catch (e) {
      master.throwError(e.message, 1);
    }
  }


};

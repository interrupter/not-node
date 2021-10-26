const log = require('not-log')(module, 'not-node//init');
const fs = require('fs');
const ADDS = require('./additional');

module.exports = class InitStartup{

  static listenPromise({config, master}){
    return new Promise((resolve, reject)=>{
      master.getHTTPServer().listen(config.get('port'), (err) => {
        if(err){reject(err);}
        log.info('Server listening on port ' + config.get('port') + '.' + (InitStartup.isSecure({config})?' For secure connections':''));
        resolve();
      });
    });
  }

  static getSSLOptions({config}){
    return {
      key: fs.readFileSync(config.get('ssl:keys:private')),
      cert: fs.readFileSync(config.get('ssl:keys:cert')), //fullchain
      ca: fs.readFileSync(config.get('ssl:keys:chain'))
    };
  }

  static async runHTTPS({config, master}){
    log.info('Setting up HTTPS server...');
    const https = require('https');
    master.getServer().set('protocol', 'https');
    master.setHTTPServer(https.createServer(InitStartup.getSSLOptions({config}), master.getServer()));
    await InitStartup.listenPromise({config, master});
  }

  static async runHTTP({config, master}){
    log.info('Setting up HTTP server...');
    const http = require('http');
    master.getServer().set('protocol', 'http');
    master.setHTTPServer(http.createServer(master.getServer()));
    await InitStartup.listenPromise({config, master});
  }

  static isSecure({config}){
    return config.get('ssl:enabled') === 'true';
  }

  static async run({options, config, master}) {
    try {
      await ADDS.run('http.pre', {options, config, master});
      if (InitStartup.isSecure()) {
        await InitStartup.runHTTPS({options, config, master});
      } else {
        await InitStartup.runHTTP({options, config, master});
      }
      await ADDS.run('http.post', {options, config, master});
    } catch (e) {
      master.throwError(e.message, 1);
    }
  }

};

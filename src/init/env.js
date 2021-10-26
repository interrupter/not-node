const log = require('not-log')(module, 'not-node//init');
const ADDS = require('./additional');

module.exports = class InitENV{
  static getProxyPort(config){
    return parseInt(config.get('proxy:port') || config.get('port'));
  }

  static getFullServerName(config){
    let name = '';
    if (config.get('proxy:secure') === true){
      name='https://';
    }else{
      name='http://';
    }
    name+=config.get('host');
    let proxyPort = this.getProxyPort();
    if(proxyPort !== 80){
      name+= (':'+proxyPort);
    }
    return name;
  }


  static async run({config, options, master}) {
    log.info('Setting up server environment variables...');
    await ADDS.run('env.pre', {config, options, master});
    if (config) {
      config.set('staticPath',  master.getAbsolutePath(config.get('path:static') || 'static'));
      config.set('modulesPath', master.getAbsolutePath(config.get('path:modules') || 'modules'));
      config.set('dbDumpsPath', master.getAbsolutePath(config.get('path:dbDumps') || '../../db.dumps'));
      config.set('appPath', options.pathToApp);
      config.set('npmPath', options.pathToNPM);
      config.set('fullServerName', this.getFullServerName());
      if(config.get('path:ws')){
        log.log('wsPath', master.getAbsolutePath(config.get('path:ws')));
        config.set('wsPath', master.getAbsolutePath(config.get('path:ws')));
      }
      await ADDS.run('env.post', {config, options, master});
    } else {
      master.throwError('No config reader');
    }
  }
};

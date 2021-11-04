const log = require('not-log')(module, 'not-node//init');
const ADDS = require('./additional');

const DEFAULT = {
  views: 'views',
  engine: 'pug'
};

module.exports = class InitTemplate{
  static loadConfig({config}){
    let val = config.get('template');
    return val || DEFAULT;
  }

  async run({ config, options, master }) {
    const input = InitTemplate.loadConfig({config});
    log.info('Setting up template (' + input.engine + ') engine...');
    await ADDS.run('template.pre', { config, options, master, input });
    master.getServer().set('views', master.getAbsolutePath(input.views));
    master.getServer().set('view engine', input.engine);
    await ADDS.run('template.post', { config, options, master });
  }
};

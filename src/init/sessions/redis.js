const log = require('not-log')(module, 'not-node//init');
const ADDS = require('../additional');

module.exports = class InitSessionsRedis{
  async run({config, options, master}) {
    log.info('Setting up user sessions handler(redis)...');
    await ADDS.run('sessions.pre', {config, options, master});
    const expressSession = require('express-session');
    const redisClient = master.getApp().getEnv('db.redis');
    const redisStore = require('connect-redis')(expressSession);
    master.getServer().use(expressSession({
      secret:             config.get('session:secret'),
      key:                config.get('session:key'),
      cookie:             config.get('session:cookie'),
      resave:             false,
      saveUninitialized:  true,
      store: new redisStore({
        host:             'localhost',
        port:             6379,
        client:           redisClient,
        ttl:              86400
      })
    }));
    await ADDS.run('sessions.post', {config, options, master});
  }

};

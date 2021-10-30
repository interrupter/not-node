const {notError} = require('not-error');
const log = require('not-log')(module, 'not-node//init');
const ADDS = require('../additional');

module.exports = class InitSessionsMongo{
  static async run({config, options, master}) {
    log.info('Setting up user sessions handler(redis)...');
    try {
      await ADDS.run('sessions.pre', {config, options, master});
      const redis = require('redis');
      const expressSession = require('express-session');
      const redisClient = redis.createClient();
      const redisStore = require('connect-redis')(expressSession);

      redisClient.on('error', (err) => {
        log.error('Sessions client error: ', err);
        this.notApp.report(new notError('User sessions storage connection failed', {}, err));
      });

      redisClient.on('warning', (err) => {
        log.error('Sessions client warning: ', err);
      });

      redisClient.on('connect', function() {
        log.info('Sessions client connected to DB');
      });

      redisClient.on('ready', function() {
        log.info('Sessions client ready');
      });

      redisClient.on('reconnecting', function() {
        log.info('Sessions client reconnecting');
      });

      redisClient.on('end', function() {
        log.info('Sessions client closed connection');
      });

      master.expressApp.use(expressSession({
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
    } catch (e) {
      master.notApp.report(new notError('User sessions init failed', {}, e));
      master.throwError(e.message, 1);
    }
  }

};

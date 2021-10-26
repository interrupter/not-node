

module.exports = class InitSessionsMongo{
  static run(input) {
    log.info('Setting up user sessions handler...');
    try {
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

      this.expressApp.use(expressSession({
        secret: this.config.get('session:secret'),
        key: this.config.get('session:key'),
        cookie: this.config.get('session:cookie'),
        resave: false,
        saveUninitialized: true,
        store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 })
      }));
    } catch (e) {
      this.notApp.report(new notError('User session init failed', {}, e));
      this.throwError(e.message, 1);
    }
  }

}

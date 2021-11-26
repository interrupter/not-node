const emit = require('./additional').run;
const log = require('not-log')(module, 'RateLimiter');

module.exports = class InitRateLimiter{

  static createMiddleware({rateLimiter}){
    return (req, res, next) => {
      rateLimiter.consume(req.ip)
        .then(() => {
          next();
        })
        .catch(() => {
          log.error('Too many requests by ' + req.ip);
          res.status(429).send('Too Many Requests');
        });
    };
  }

  async run({config, master}){
    await emit('rateLimiter.pre', { config, master});
    const rateLimiter = InitRateLimiter.createRateLimiter({config, master});
    const middleware = InitRateLimiter.createMiddleware({rateLimiter});
    master.getServer().use(middleware);
    await emit('rateLimiter.post', { config, master});
  }

  static createRateLimiter({master}){
    const {RateLimiterRedis} = require('rate-limiter-flexible');
    return new RateLimiterRedis({
      storeClient:  master.getEnv('db.redis'),
      keyPrefix:    'middleware',
      points:       100,     // 10 requests
      duration:     1,    // per 1 second by IP
    });
  }
};

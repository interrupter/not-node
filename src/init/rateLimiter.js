const emit = require('./additional').run;
const log = require('not-log')(module, 'RateLimiter');

const DEFAULT_OPTIONS = {
  keyPrefix: 'rateLimiterMiddleware',
  points: 20,
  duration: 1
};

module.exports = class InitRateLimiter{

  static createMiddleware({rateLimiter}){
    return (req, res, next) => {
      rateLimiter.consume(req.ip)
        .then(() =>  next())
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


  getOptions({config}){
    return {
      ...DEFAULT_OPTIONS,
      ...config.get('modules.rateLimiter', {})
    };
  }

  static createRateLimiter({master, config}){
    const {RateLimiterRedis} = require('rate-limiter-flexible');
    return new RateLimiterRedis({
      storeClient:  master.getEnv('db.redis'),
      ...this.getOptions({master, config})
    });
  }
};

const emit = require('./additional').run;
const log = require('not-log')(module, 'RateLimiter');
const {partCopyObj} = require('../common');

const DEFAULT_OPTIONS = {
  keyPrefix: 'rateLimiterMiddleware',
  points: 20,
  duration: 1
};

const DEFAULT_CLIENT = 'ioredis';

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


  static getOptions({config}){
    const opts = partCopyObj(config.get('modules.rateLimiter', {}), Object.keys(DEFAULT_OPTIONS));
    return {
      ...DEFAULT_OPTIONS,
      ...opts
    };
  }

  static createRateLimiter({master, config}){
    const {RateLimiterRedis} = require('rate-limiter-flexible');
    const storeClient = config.get('modules.rateLimiter.client', DEFAULT_CLIENT);
    return new RateLimiterRedis({
      storeClient:  master.getEnv(`db.${storeClient}`),
      ...InitRateLimiter.getOptions({master, config})
    });
  }
};

const {notError} = require('not-error');
const log = require('not-log')(module, 'not-node//init');
const ADDS = require('../additional');

module.exports = class InitSessionsMongo{
  static createStore({config, master, expressSession}){
    const MongoDBStore = require('connect-mongodb-session')(expressSession);
    const mongooseOptions = config.get('mongoose.options');
    let store = new MongoDBStore({
      uri: `mongodb://${mongooseOptions.user}:${mongooseOptions.pass}@${mongooseOptions.host}/${mongooseOptions.db}`,
      databaseName: mongooseOptions.db,
      collection: 'sessions'
    });
    store.on('connected', function () {
      log.info('Sessions connected');
    });
    // Catch errors
    store.on('error', function(error) {
      if (error) {
        master.notApp.report(new notError('User sessions storage connection failed', {}, error));
      }
    });
    return store;
  }

  static async run({config, options, master}) {
    const expressSession = require('express-session');
    log.info('Setting up user sessions handler(mongo)...');
    try {
      await ADDS.run('sessions.pre', {config, options, master});
      master.expressApp.use(expressSession({
        secret: config.get('session:secret'),
        key: config.get('session:key'),
        cookie: config.get('session:cookie'),
        resave: true,
        saveUninitialized: true,
        store: InitSessionsMongo.createStore({config, expressSession})
      }));
      await ADDS.run('sessions.post', {config, options, master});
    } catch (e) {
      master.notApp.report(new notError('User sessions init failed', {}, e));
      master.throwError(e.message, 1);
    }
  }

};

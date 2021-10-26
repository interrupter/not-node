const log = require('not-log')(module, 'not-node//init');
const ADDS = require('./additional');
const Increment = require('../model/increment.js');

module.exports = class InitDB{

  static fixMongooseOptions(opts){
    let options = JSON.parse(JSON.stringify(opts));
    delete options.host;
    delete options.db;
    return options;
  }

  static async initMongoose({ config, /*options,*/ master}) {
    try {
      log.info('Setting up mongoose connection...');
      const mongoose = require('mongoose');
      mongoose.Promise = global.Promise;
      let mongooseOptions = config.get('mongoose');
      await mongoose.connect(mongooseOptions.uri, InitDB.fixMongooseOptions(mongooseOptions.options));
      log.info('Mongoose connected...');
      Increment.init(mongoose);
      master.setMongoose(mongoose);
    } catch (e) {
      log.error(e);
      master.throwError(e.message, 1);
    }
  }

  static async run({config, options, master}){
    await ADDS.run('db.pre', {config, options, master});
    await InitDB.initMongoose({config, options, master});
    await ADDS.run('db.post', {config, options, master});
  }

};

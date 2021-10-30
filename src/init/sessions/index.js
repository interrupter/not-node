const InitSessionsMongo = require('./mongo');

module.exports = class InitSessions{

  static async run(input) {
    try{
      await InitSessionsMongo.run(input);
    }catch(e){
      input.master.throwError(e.message, 1);
    }
  }

};

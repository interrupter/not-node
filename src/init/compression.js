
module.exports = class InitCompression{
  async run({master/*, config*/}){
    //compress output
    const compression = require('compression');
    master.getServer().use(compression());
  }
};

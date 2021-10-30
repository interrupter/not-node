const log = require('not-log')(module, 'notModule');
const notLocale = require('not-locale');

module.exports = class notModuleRegistratorLocales{
  constructor({nModule}){
    this.run({nModule});
  }

  run({nModule}){
    const srcDir = notModuleRegistratorLocales.getPath(nModule);
    if (!srcDir) { return false; }
    notLocale.fromDir(srcDir, nModule.getName()).catch(log.error);
    return true;
  }

  static getPath(nModule){
    return nModule.module.paths.locales;
  }

};

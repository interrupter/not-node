const path = require('path');
const Fields = require('../fields');
const notLocale = require('not-locale');

module.exports = class InitCore{
  static paths = {
    fields: path.resolve(__dirname, '../core/fields'),
    locales: path.resolve(__dirname, '../core/locales'),
  };

  async run(){
    Fields.importFromDir(InitCore.paths.fields);
    await notLocale.fromDir(InitCore.paths.locales, 'core');
  }
};

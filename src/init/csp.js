const log = require('not-log')(module, 'not-node//init');

module.exports = class InitCSP {

  static run({config}) {
    try {
      let corsArr = config.get('cors');
      let corsLine = (corsArr ? corsArr.join(' ') : '');
      let CSPDirectives = config.get('CSP');
      let result = {};
      Object.keys(CSPDirectives).forEach((nm) => {
        result[nm + 'Src'] = CSPDirectives[nm].join(' ');
        if (['default', 'connect'].includes(nm)) {
          result[nm + 'Src'] += (' ' + corsLine);
        }
      });
      return result;
    } catch (e) {
      log.error(e);
      return {};
    }
  }

};

const log = require('not-log')(module, 'not-node//init');
const {notError} = require('not-error');

module.exports = class InitMonitoring {
  static run() {
    try {
      let monitor = require('not-monitor').monitor;
      monitor.on('afterReportError', (err, result) => {
        log.error('Report error', err ? err.message : 'null error');
        log.error(result);
        if (err) {
          this.notApp.report(new notError('Monitor reporting error', {
            result
          }, err));
        } else {
          this.notApp.report(new notError('Monitor reporting error', {
            result
          }));
        }
      });
      log.log('Development monitor initialized');
    } catch (e) {
      log.error(e);
      this.throwError(e.message, 1);
    }
  }

};

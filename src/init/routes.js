const serveStatic = require('serve-static');
const log = require('not-log')(module, 'not-node//init');
const {notError, notRequestError} = require('not-error');

module.exports = class InitRoutes {
  static async run() {
    try {
      log.info('Setting up routes...');
      this.exposeFrontStatic();
      this.notApp.expose(this.expressApp);
      require(this.options.routesPath)(this.expressApp, this.notApp);
      this.expressApp.use(serveStatic(this.config.get('staticPath')));
      this.expressApp.use(this.options.indexRoute);
      this.expressApp.use((err, req, res) => {
        if(err instanceof notError){
          this.notApp.report(err);
          if(err instanceof notRequestError){
            if(err.getRedirect()){
              res.redirect(err.getRedirect());
            }else{
              res.status(err.getCode()).json({
                status: 'error',
                error:  err.options.message || err.options.error,
                errors: err.getErrors(),
              });
            }
          }
        }else if (err instanceof Error && (res && res.status && res.json)){
          res.status(err.statusCode || 500);
          this.notApp.report(new notError(`Internal error(${res.statusCode}): %${req.url} - %${err.message}`, {}, err));
          res.json({
            status: 'error',
            error: err.message
          });
        }
      });
    } catch (e) {
      this.throwError(e.message, 1);
    }
  }

};

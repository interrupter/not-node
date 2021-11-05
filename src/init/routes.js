'use strict';

const serveStatic = require('serve-static');
const log = require('not-log')(module, 'not-node//init');
const {notError, notRequestError} = require('not-error');

module.exports = class InitRoutes {

  static finalError({master}){
    return (err, req, res) => {
      if(err instanceof notError){
        master.getApp().report(err);
        if(err instanceof notRequestError){
          if(err.getRedirect()){
            res.redirect(err.getRedirect());
          }else{

            res.status(err.getCode()).json({
              status: 'error',
              error: err.getResult().message,
              errors: err.getResult().errors
            });
          }
        }
      }else if (err instanceof Error && (res && res.status && res.json)){
        res.status(err.statusCode || 500);
        master.getApp().report(new notError(`Internal error(${res.statusCode}): %${req.url} - %${err.message}`, {}, err));
        res.json({
          status: 'error',
          error: err.message
        });
      }else{
        log.error('Unknown error:', err);
        res.status(500).json({
          status: 'error'
        });
      }
    };
  }

  async run({master, config, options}) {
    log.info('Setting up routes...');
    master.getApp().expose(master.getServer());
    require(options.routesPath)(master.getServer(), master.getApp());
    master.getApp().use(serveStatic(config.get('staticPath')));
    master.getApp().use(options.indexRoute);
    master.getApp().use(InitRoutes.finalError({master}));
  }

};

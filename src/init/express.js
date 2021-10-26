const initCSP = require('./csp');
const emit = require('./additional').run;
const log = require('not-log')(module, 'not-node//init');

module.exports = class InitExpress{

  static requestLogging({/*config, options, */master}){
    master.getServer().use((req, res, next) => {
      log.log(req.ip, req.method, req.url);
      return next();
    });
  }

  static addCompression({master/*, config*/}){
    //compress output
    const compression = require('compression');
    master.getServer().use(compression());
  }

  static async run({options, config, master}) {
    try{
      log.info('Init express app...');
      await emit('express.pre', {options, config, master});
      //express
      const express = require('express');
      master.setServer(express());
      InitExpress.requestLogging({options, config, master});
      //security directives by helmet
      await InitExpress.initHelmet({options, config, master});
      InitExpress.addCompression({options, config, master});
      InitExpress.addFileupload({options, config, master});
      InitExpress.addBodyParser({options, config, master});
      InitExpress.addMethodOverride({options, config, master});
      await emit('express.post', {options, config, master});
    }catch(e){
      master.throwError(e.message, 1);
    }
  }

  static async initHelmet({options, config, master}){
    //adding protection
    const helmet = require('helmet');
    const CSPDirectives = initCSP.run({options, config, master});
    master.getServer().use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            ...CSPDirectives,
            upgradeInsecureRequests: [],
          }
        }
      })
    );
  }

  static addFileupload({/*options, config,*/ master}){
    const fileUpload = require('express-fileupload');
    master.getServer().use(
      fileUpload(
        {
          createParentPath: true
        }
      )
    );
  }


  static addBodyParser({/*options, config,*/ master}){
    //HTTP input formating
    const bodyParser = require('body-parser');
    master.getServer().use(bodyParser.json({limit: '150mb'}));
    // for parsing application/json
    master.getServer().use(bodyParser.urlencoded({
      limit: '150mb',
      extended: true
    }));
    // for parsing application/x-www-form-urlencode
  }

  static addMethodOverride({/*options, config,*/ master}){
    const methodOverride = require('method-override');
    master.getServer().use(methodOverride());
  }

};

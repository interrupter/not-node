
const initEnv = require('./env');
const initDB = require('./db');
const initExpress = require('./express');
const initCompression = require('./compression');
const initSecurity = require('./security');
const initBodyparser = require('./bodyparser');
const initMethodOverride = require('./methodoverride');
const initFileupload = require('./fileupload');
const initNotApp = require('./app');
const initSessions = require('./sessions');
const initTemplate = require('./template');
const initCORS = require('./cors');
const initMiddleware = require('./middleware');
const initStatic = require('./static');
const initRoutes = require('./routes');
const initModules = require('./modules');
const initInformer = require('./informer');
const initHTTP = require('./http');
const initMonitoring = require('./monitoring');

module.exports = [
  //creating set of variables derived from basic ones,
  //such as various paths, server names and URIs
  initEnv,
  //DB access
  initDB,
  //http(s) server
  initExpress,
  //CSP security directives
  initSecurity,
  //gzip compression
  initCompression,
  initFileupload,
  initBodyparser,
  initMethodOverride,
  //not-node core
  initNotApp,
  //user sessions
  initSessions,
  //template engine
  initTemplate,
  //CORS rules
  initCORS,
  //various not-* middleware from all sources
  initMiddleware,
  initStatic,
  initRoutes,
  initModules,
  //messaging platform
  initInformer,
  initHTTP,
  initMonitoring,

];

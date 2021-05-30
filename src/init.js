const
  ENV = (process.env.NODE_ENV || 'development'),
  serveStatic = require('serve-static'),
  path = require('path'),
  fs = require('fs'),
  Increment = require('./model/increment.js'),
  notAppConstructor = require('./app.js'),
  {
    notError,
    notErrorReporter
  } = require('not-error'),
  //notStore = require('not-store'),
  logger = require('not-log'),
  log = logger(module, 'not-node:Init');

class Init {
  static options =  false;
  static manifest = false;
  static config = false;
  static mongoose = false;
  static notApp = false;
  static expressApp = false;
  static httpServer = false;
  static WSServer = false;
  static WSClient = false;

  static setManifest(manifest) {
    this.manifest = manifest;
  }

  static initConfig() {
    this.config = require('not-config').createReader();
  }

  static getProxyPort(){
    return parseInt(this.config.get('proxy:port') || this.config.get('port'));
  }

  static getFullServerName(){
    let name = '';
    if (this.config.get('proxy:secure') === true){
      name='https://';
    }else{
      name='http://';
    }
    name+=this.config.get('host');
    let proxyPort = this.getProxyPort();
    if(proxyPort !== 80){
      name+= (':'+proxyPort);
    }
    return name;
  }

  static getAbsolutePath(subPath){
    return path.resolve(this.options.pathToApp, subPath);
  }

  static initEnv() {
    log.info('Setting up server environment variables...');
    if (this.config) {
      this.config.set('staticPath',  this.getAbsolutePath(this.config.get('path:static') || 'static'));
      this.config.set('modulesPath', this.getAbsolutePath(this.config.get('path:modules') || 'modules'));
      this.config.set('dbDumpsPath', this.getAbsolutePath(this.config.get('path:dbDumps') || '../../db.dumps'));
      this.config.set('appPath', this.options.pathToApp);
      this.config.set('npmPath', this.options.pathToNPM);
      this.config.set('fullServerName', this.getFullServerName());
      if(this.config.get('path:ws')){
        log.log('wsPath', this.getAbsolutePath(this.config.get('path:ws')));
        this.config.set('wsPath', this.getAbsolutePath(this.config.get('path:ws')));
      }
    } else {
      this.throwError('No config reader');
    }
  }

  static getCSPDirectives() {
    try {
      let corsArr = this.config.get('cors');
      let corsLine = (corsArr ? corsArr.join(' ') : '');
      let CSPDirectives = this.config.get('CSP');
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


  static initMonitor() {
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

  static initMongoose(input) {
    try {
      log.info('Setting up mongoose connection...');
      this.mongoose = require('mongoose');
      this.mongoose.Promise = global.Promise;
      this.mongoose.connect(input.uri, input.options)
        .then(() => {
          log.info('Mongoose connected...');
        })
        .catch((e) => {
          log.error(e);
          this.throwError(e.message, 1);
        });
      Increment.init(this.mongoose);
    } catch (e) {
      log.error(e);
      this.throwError(e.message, 1);
    }
  }

  static initExpressApp() {
    const express = require('express');
    this.expressApp = express();
    //adding protection
    const helmet = require('helmet');
    this.expressApp.use(helmet({
      contentSecurityPolicy: {
        directives: {
          ...this.getCSPDirectives(),
          upgradeInsecureRequests: [],
        }
      }
    }));
    //compress output
    const compression = require('compression');
    this.expressApp.use(compression());
  }

  static initNotApp({additional}) {
    this.notApp = new notAppConstructor({
      mongoose: this.mongoose
    });
    //
    this.notApp.setEnv('hostname', this.config.get('hostname'));
    this.notApp.setEnv('server', `https://` + this.config.get('host'));
    this.notApp.setEnv('appPath', this.config.get('appPath'));
    this.notApp.setEnv('name', this.manifest.name);
    this.notApp.setEnv('fullServerName', this.config.get('fullServerName'));
    this.notApp.setEnv('dbDumpsPath', this.config.get('dbDumpsPath'));
    this.notApp.setEnv('rolesPriority', this.manifest.targets.server.roles);
    this.notApp.ENV = ENV;

    if(additional && additional.initNotAppEnv){
      additional.initNotAppEnv();
    }

    this.notApp.importModulesFrom(this.config.get('modulesPath'));

    //
    if (Array.isArray(this.config.get('importModulesFromNPM'))) {
      this.config.get('importModulesFromNPM').forEach((modName) => {
        this.notApp.importModuleFrom(path.join(this.config.get('npmPath'), modName), modName);
      });
    }

    try {
      notErrorReporter.setOrigin({ server: this.config.get('host')});
      this.notApp.reporter = notErrorReporter;
      this.notApp.logger = logger(module, 'notApplication');
    } catch (e) {
      log.error(e);
    }

    this.expressApp.use((req, res, next) => {
      log.log(req.ip, req.method, req.url);
      return next();
    });
    //HTTP input formating
    const bodyParser = require('body-parser');
    this.expressApp.use(bodyParser.json({
      limit: '150mb'
    }));
    // for parsing application/json
    this.expressApp.use(bodyParser.urlencoded({
      limit: '150mb',
      extended: true
    })); // for parsing application/x-www-form-urlencode
    const methodOverride = require('method-override');
    this.expressApp.use(methodOverride());
  }

  static initServerApp({additional}) {
    try {
      log.info('Init express app...');
      //init express
      this.initExpressApp();
      //init notApp
      log.info('Init not-app...');
      this.initNotApp({additional});
    } catch (e) {
      log.error(e);
      this.throwError(e.message, 1);
    }
  }

  static initTemplateEngine(input = {
    views: 'views',
    engine: 'pug'
  }) {
    log.info('Setting up template (' + input.engine + ') engine...');
    this.expressApp.set('views', this.getAbsolutePath(input.views));
    this.expressApp.set('view engine', input.engine);
  }

  static initUserSessions(input) {
    log.info('Setting up user sessions handler...');
    try {
      const expressSession = require('express-session');
      const MongoDBStore = require('connect-mongodb-session')(expressSession);
      let store = new MongoDBStore({
        uri: `mongodb://${input.options.user}:${input.options.pass}@${input.options.host}/${input.options.db}`,
        databaseName: input.options.db,
        collection: 'sessions'
      });
      store.on('connected', function() {
        log.info('Sessions connected');
      });
      // Catch errors
      store.on('error', function(error) {
        if (error) {
          this.notApp.report(new notError('User sessions storage connection failed', {}, error));
        }
      });
      this.expressApp.use(expressSession({
        secret: this.config.get('session:secret'),
        key: this.config.get('session:key'),
        cookie: this.config.get('session:cookie'),
        resave: true,
        saveUninitialized: true,
        store
      }));
    } catch (e) {
      this.notApp.report(new notError('User session init failed', {}, e));
      this.throwError(e.message, 1);
    }
  }


  static initCORS(whitelist) {
    const cors = require('cors');
    log.info('Setting up CORS rules...');
    log.info('Whitelist: ', whitelist.join(', '));
    let corsOptions = {
      origin: function(origin, callback) {
        let originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
      },
      credentials: true
    };
    log.info('CORS options', corsOptions);
    this.expressApp.use(cors(corsOptions));
  }


  static printOutManifest = () => {
    log.debug('Manifest:');
    log.debug(JSON.stringify(this.notApp.getManifest(), null, 4));
  }


  static initMiddleware(input) {
    log.info('Setting up middlewares...');
    try {
      if (input) {
        for (let ware in input) {
          if (ware) {
            let warePath = input[ware].path || ware,
              proc;
            if (require(warePath).getMiddleware) {
              proc = require(warePath).getMiddleware(input[ware]);
            } else if (require(warePath).middleware) {
              proc = require(warePath).middleware;
            } else {
              proc = require(warePath);
            }
            this.expressApp.use(proc);
          }
        }
      }
    } catch (e) {
      this.throwError(e.message, 1);
    }
  }

  static createStaticFrontServer(ext){
    return (req, res, next) => {
      let rolesPriority = this.config.get('user:roles:priority') || ['root', 'admin', 'client', 'user', 'guest'],
        frontAppRoot = this.config.get('path:front'),
        frontApp = path.join(frontAppRoot, `guest.${ext}`);
      if (req.user) {
        for (let role of rolesPriority) {
          if (req.user.role.indexOf(role) > -1) {
            frontApp = path.join(frontAppRoot, role + `.${ext}`);
            break;
          }
        }
      }
      let pathTo = path.resolve(this.options.pathToApp, frontApp);
      return serveStatic(pathTo)(req, res, next);
    }
  }

  static exposeFrontStatic() {
    this.expressApp.use('/front/(:role).js', this.createStaticFrontServer('js'));
    this.expressApp.use('/front/(:role).css', this.createStaticFrontServer('css'));
  }

  static initExposeRoutes() {
    try {
      log.info('Setting up routes...');
      this.exposeFrontStatic();
      this.notApp.expose(this.expressApp);
      require(this.options.routesPath)(this.expressApp, this.notApp);
      this.expressApp.use(serveStatic(this.config.get('staticPath')));
      this.expressApp.use(this.options.indexRoute);
      this.expressApp.use((err, req, res) => {
        if (res && res.status && res.json) {
          res.status(err.statusCode || 500);
          this.notApp.report(`Internal error(${res.statusCode}): %${req.url} - %${err.message}`);
          res.json({
            error: err.message
          });
        }
        return;
      });
    } catch (e) {
      this.throwError(e.message, 1);
    }
  }

  static initModules() {
    this.notApp.execInModules('initialize');
  }

  static initInformer() {
    try {
      log.log('try to create informer');
      const {
        Inform
      } = require('not-inform');
      this.notApp.informer = new Inform();
    } catch (e) {
      this.throwError(e.message, 1);
    }
  }

  static startup() {
    try {
      if (this.config.get('ssl:enabled') === 'true') {
        log.info('Setting up HTTPS server...');
        const https = require('https');
        this.expressApp.set('protocol', 'https');
        let options = {
          key: fs.readFileSync(this.config.get('ssl:keys:private')),
          cert: fs.readFileSync(this.config.get('ssl:keys:cert')), //fullchain
          ca: fs.readFileSync(this.config.get('ssl:keys:chain'))
        };
        this.httpServer = https.createServer(options, this.expressApp);
        this.httpServer.listen(this.config.get('port'), () => {
          log.info('Server listening on port ' + this.config.get('port') + '. For secure connections.');
        });
      } else {
        log.info('Setting up HTTP server...');
        const http = require('http');
        this.expressApp.set('protocol', 'http');
        this.httpServer = http.createServer(this.expressApp);
        this.httpServer.listen(this.config.get('port'), () => {
          log.info('Server listening on port ' + this.config.get('port'));
        });
      }
    } catch (e) {
      this.throwError(e.message, 1);
    }
  }

  static run({options, manifest, additional}) {
    this.options = options; // pathToApp, pathToNPM
    this.setManifest(manifest);
    log.info('Kick start app...');
    this.initConfig();
    this.initEnv();

    if(additional && additional.initEnv && typeof additional.initEnv === 'function'){
      additional.initEnv();
    }

    if (this.config.get('mongoose')) {
      this.initMongoose(this.config.get('mongoose'));
    }else{
      log.error('CORS off');
    }

    if (this.config.get('hostname')) {
      this.initServerApp({additional});
    }else{
      log.error('no hostname');
    }

    if (this.config.get('session')) {
      this.initUserSessions(this.config.get('mongoose'));
    }else{
      log.error('user sessions off');
    }

    if (this.config.get('template')) {
      this.initTemplateEngine(this.config.get('template'));
    }else{
      log.error('template off');
    }

    if (this.config.get('cors')) {
      this.initCORS(this.config.get('cors'));
    }else{
      log.error('CORS off');
    }

    if (this.config.get('middleware')) {
      this.initMiddleware(this.config.get('middleware'));
    }else{
      log.error('middleware off');
    }

    if (this.notApp) {
      this.initExposeRoutes();
    }else{
      log.error('notApp off');
    }

    if (this.expressApp) {
      this.initModules();
    }else{
      log.error('expressApp off');
    }

    if (this.config.get('modules:informer')) {
      this.initInformer();
    }else{
      log.error('informer off');
    }

    this.startup();
    //startup server
    if (options.monitor) {
      this.initMonitor();
    }else{
      log.error('monitor off');
    }
  }

  static throwError(errMsg = 'Fatal error', errCode = 1) {
    log.error(errMsg);
    log.log(`Exit process...with code ${errCode}`);
    process.exit(errCode);
  }


}

exports.Init = Init;

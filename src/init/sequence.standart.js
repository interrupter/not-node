const initEnv = require("./lib/env");
const initDB = require("./lib/db");
const initIdentity = require("./lib/identity");
const InitDBRedlock = require("./lib/redlock");
const initExpress = require("./lib/express");
const initCompression = require("./lib/compression");
const initSecurity = require("./lib/security");
const initBodyparser = require("./lib/bodyparser");
const initMethodOverride = require("./lib/methodoverride");
const initFileupload = require("./lib/fileupload");
const initNotApp = require("./lib/app");
const initSessions = require("./lib/sessions");
const initTemplate = require("./lib/template");
const initCORS = require("./lib/cors");
//const initCore = require('./core');
const initMiddleware = require("./lib/middleware");
const initStatic = require("./lib/static");
const initRoutes = require("./lib/routes");
const initRateLimiter = require("./lib/rateLimiter");
const initModules = require("./lib/modules");
const initInformer = require("./lib/informer");
const initHTTP = require("./lib/http");
const initMonitoring = require("./lib/monitoring");

module.exports = [
    //creating set of variables derived from basic ones,
    //such as various paths, server names and URIs
    initEnv,
    //DB access drivers
    initDB,
    //user Identity roles
    initIdentity,
    //locking mech based upon ioredis
    InitDBRedlock,
    //http(s) server
    initExpress,
    initRateLimiter,
    //CSP security directives
    initSecurity,
    //gzip compression
    initCompression,
    initFileupload,
    initBodyparser,
    initMethodOverride,
    //not-node core
    initNotApp,
    //init various resources like common object fields descriptions and locales
    //initCore,
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

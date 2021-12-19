const BatchRunner = require('../batchRunner.js');

/**
 * Logic to find and register resources of notModule
 * @module notModuleRegistrator
 **/

const
  notModuleInitializatorForms = require('./forms'),
  notModuleInitializatorModels = require('./models'),
  notModuleInitializatorManifests = require('./manifests');


const DEFAULT_INITIALIZATORS = [
  notModuleInitializatorForms,
  notModuleInitializatorModels,
  notModuleInitializatorManifests
];

/**
 * Initialize registered notModule resouces
 * @class
 **/
module.exports  = new BatchRunner(DEFAULT_INITIALIZATORS);

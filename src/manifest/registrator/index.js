const BatchRunner = require("../batchRunner.js");

/**
 * Logic to find and register resources of notModule
 * @module notModuleRegistrator
 **/

const notModuleRegistratorFields = require("./fields"),
    notModuleRegistratorForms = require("./forms"),
    notModuleRegistratorModels = require("./models"),
    notModuleRegistratorLogics = require("./logics"),
    notModuleRegistratorRoutes = require("./routes"),
    notModuleRegistratorLocales = require("./locales");

const DEFAULT_REGISTRATORS = [
    notModuleRegistratorFields,
    notModuleRegistratorForms,
    notModuleRegistratorModels,
    notModuleRegistratorLogics,
    notModuleRegistratorRoutes,
    notModuleRegistratorLocales,
];

/**
 * Search and register notModule resouces
 * @class
 **/
module.exports = new BatchRunner(DEFAULT_REGISTRATORS);

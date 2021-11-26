/**
 * Logic to find and register resources of notModule
 * @module notModuleRegistrator
 **/

const
  notModuleRegistratorFields = require('./fields'),
  notModuleRegistratorForms = require('./forms'),
  notModuleRegistratorModels = require('./models'),
  notModuleRegistratorLogics = require('./logics'),
  notModuleRegistratorRoutes = require('./routes'),
  notModuleRegistratorLocales = require('./locales');


const DEFAULT_REGISTRATORS = [
  notModuleRegistratorFields,
  notModuleRegistratorForms,
  notModuleRegistratorModels,
  notModuleRegistratorLogics,
  notModuleRegistratorRoutes,
  notModuleRegistratorLocales
];

/**
 * Search and register notModule resouces
 * @class
 **/
module.exports  = class notModuleRegistrator{

  static registrators = [...DEFAULT_REGISTRATORS];

  static setRegistrators(list){
    notModuleRegistrator.registrators = [...list];
  }

  static resetRegistrators(){
    notModuleRegistrator.setRegistrators(DEFAULT_REGISTRATORS);
  }

  /**
  * Searching for content of module and registering it.
  * @static
  * @param {Object}      input
  * @param {notModule}   input.nModule
  * @return {boolean}                       true - executed, false - no paths
  **/
  static registerContent({nModule}) {
    if (!nModule.module.paths) {return false;}
    //starting from simpliest forms and moving upwards
    notModuleRegistrator.registrators.forEach(registrator => new registrator({nModule}));
    return true;
  }

};

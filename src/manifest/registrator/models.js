const fs = require('fs');
const path = require('path');
const logger = require('not-log');
const log = logger(module, 'notModule');

const {tryFile, mapBind} = require('../../common');
/**
 * List of methods to be binded from notApp to models
 * @constant
 * @type {string}
 **/
const MODEL_BINDINGS_LIST = [
  'getModel', 'getModelFile', 'getModelSchema',
  'getModule'
];

module.exports = class notModuleRegistratorModels{
  static openFile = require;
  constructor({nModule}){
    this.run({nModule});
  }

  run({nModule}){
    const srcDir = notModuleRegistratorModels.getPath(nModule);
    if (!srcDir) { return false; }
    this.findAll(
      {
        nModule,
        srcDir
      }
    );
    return true;
  }

  static getPath(nModule){
    return nModule.module.paths.models;
  }

  /**
  * Searching fields in directory
  * @static
  * @param {Object}     input
  * @param {notModule}  input.notModule
  * @param {string}     input.srcDir
  **/
  findAll({nModule,srcDir}){
    fs.readdirSync(srcDir).forEach((file) => {
      let fromPath = path.join(srcDir, file);
      log.info(`Checking model in ${fromPath}`);
      if (!tryFile(fromPath)) { return; }
      this.register({nModule, fromPath, file});
    });
  }

  register({nModule, fromPath, file}){
    const model = notModuleRegistratorModels.openFile(fromPath);
    const modelName = notModuleRegistratorModels.getName({model, file});
    this.extend({nModule, model, modelName, fromPath});
    nModule.setModel(modelName, model);
    log.info(`Model registered: ${modelName}`);
  }

  extend({nModule, model, modelName, fromPath}) {
    model.filename = fromPath;
    if (nModule.appIsSet()) {
      mapBind(nModule.getApp(), model, MODEL_BINDINGS_LIST);
    }
    model.log = logger(model, `Model#${modelName}`);
    model.getThisModule = () => nModule;
  }

  static getName({model, file}){
    let modelName = file;
    if (model && model.thisModelName) {
      modelName = model.thisModelName;
    }
    return modelName;
  }

};

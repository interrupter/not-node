const log = require('not-log')(module, 'notModule');
const protoModel = require('../../model/proto.js');
const {initFileSchemaFromFields} = require('../../fields');
module.exports = class notModuleInitializatorModels{
  static openFile = require;
  constructor({nModule}){
    this.run({nModule, app: nModule.getApp()});
  }

  run({app, nModule}) {
    for(let modelName in nModule.getModels()) {
      log.info(`Fabricating model schema: ${modelName}`);
      initFileSchemaFromFields({
        app,
        mod: this.getModelFile(modelName),
        type: 'model',
        from: ':FIELDS',
        to:   ':thisSchema',
      });
      log.info(`Fabricating model: ${modelName}`);
      protoModel.fabricate(nModule.getModelFile(modelName), nModule.getOptions(), nModule.mongoose);
    }
  }


};

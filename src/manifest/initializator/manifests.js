const log = require('not-log')(module, 'notModule');
const {initManifestFields} = require('../../fields');
const {firstLetterToUpper} = require('../../common');

module.exports = class notModuleInitializatorManifests{
  static openFile = require;
  constructor({nModule}){
    this.run({nModule});
  }

  run({nModule}) {
    for(let routeName in nModule.getRoutesManifests()) {
      log.info(`Fabricating manifest schema: ${routeName}`);
      const mod = nModule.getRouteManifest(routeName);
      if(mod && Array.isArray(mod.fields)){
        const rawMutationsList = [...mod.fields];
        const ModelName = firstLetterToUpper(mod.model);
        const schema = nModule.getModelSchema(ModelName);
        mod.fields = initManifestFields(
          nModule.getApp(),
          schema,
          rawMutationsList
        );
      }
    }
  }


};

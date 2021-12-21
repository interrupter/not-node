const {notError} = require('not-error');
const {log,error} = require('not-log')(module, 'initializator');
const {initManifestFields} = require('../../fields');
const {firstLetterToUpper} = require('../../common');

module.exports = class notModuleInitializatorManifests{
  static openFile = require;
  constructor({nModule}){
    this.run({nModule});
  }

  run({nModule}) {
    const moduleName = nModule.getName();
    for(let routeName in nModule.getRoutesManifests()) {
      try{
        const mod = nModule.getRouteManifest(routeName);
        if(mod && Array.isArray(mod.fields)){
          const rawMutationsList = [...mod.fields];
          const ModelName = firstLetterToUpper(mod.model);
          const schema = nModule.getModelSchema(ModelName);
          let privateFields = [];
          if (mod.privateFields){
            privateFields = Array.isArray(mod.privateFields)?[...mod.privateFields]:[];
            delete mod.privateFields;
          }
          mod.fields = initManifestFields(
            nModule.getApp(),
            schema,
            rawMutationsList,
            privateFields,
            moduleName,
          );
        }
      }catch(e){
        error(`Error while initialization of route: ${moduleName}//${routeName}`);
        if(e instanceof notError){
          error(`name: ${e.options.field}, type: ${e.options.type}`);
        }else{
          error(e);
        }
      }

    }
  }


};

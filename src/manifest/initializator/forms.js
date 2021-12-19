const {log} = require('not-log')(module, 'notModule');

module.exports = class notModuleInitializatorForms{

  static openFile = require;

  constructor({nModule}){
    this.run({nModule, app: nModule.getApp()});
  }

  run({app, nModule}){
    for (let formName in nModule.getFormsConstructors()) {
      log.info(`Fabricating form: ${formName}`);
      const formConstructor = nModule.getFormConstructor(formName);
      this.setForm(formName, new formConstructor({app}));
    }
  }

};

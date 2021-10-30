const path = require('path');
const fs = require('fs');
const {tryFile, objHas} = require('../../common');
const Fields = require('../../fields.js');

module.exports = class notModuleRegistratorFields{

  static openFile = require;
  static fieldsManager = Fields;

  constructor({nModule}){
    this.run({nModule});
  }

  run({nModule}){
    const srcDir = notModuleRegistratorFields.getPath(nModule);
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
    return nModule.module.paths.fields;
  }


  registerFields({lib, fieldsImportRules}){
    notModuleRegistratorFields.fieldsManager.registerFields(
      lib,  //fields dictionary
      fieldsImportRules //global import rules
    );
  }

  registerField({name, field, fieldsImportRules}){
    notModuleRegistratorFields.fieldsManager.registerField(
      name, //field name
      field,       //field description
      fieldsImportRules //global import rules
    );
  }



  /**
  * Searching fields in directory
  * @param {Object}     input
  * @param {notModule}  input.notModule
  * @param {string}     input.srcDir
  **/
  findAll({nModule, srcDir}){
    fs.readdirSync(srcDir).forEach((file) => {
      let fromPath = path.join(srcDir, file);
      if (!tryFile(fromPath)) { return; }
      this.register({nModule, fromPath});
    });
  }

  register({nModule, fromPath}){
    let fields = notModuleRegistratorFields.openFile(fromPath);
    if (fields && objHas(fields, 'FIELDS')) {//collection
      this.registerFields({
        lib: fields.FIELDS,  //fields dictionary
        fieldsImportRules: nModule.fieldsImportRules //global import rules
      });
    } else {//single file fieldname.js
      const parts = path.parse(fromPath);
      this.registerField({
        name: parts.name, //fields name
        field: fields,       //field description
        fieldsImportRules: nModule.fieldsImportRules //global import rules
      });
    }
  }



};

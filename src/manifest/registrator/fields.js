const path = require('path');
const fs = require('fs');
const {tryFile, objHas} = require('../../common');
const Fields = require('../../fields');

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

  registerFields({ nModule, lib, fromPath}){
    for(let t in lib){
      this.registerField({
        nModule,
        name: t,
        field: lib[t],
        fromPath
      });
    }
  }

  registerField({nModule, name, field, fromPath}){
    this.extendByFrontValidators({name, field, fromPath});
    nModule.setField(name, field);
  }

  /**
  *
  **/
  extendByFrontValidators({name, field, fromPath}){
    if(!(field && objHas(field, 'model'))){ return; }
    //load validators
    const validatorName = path.join(fromPath, 'validators', name + '.js');
    if(!tryFile(validatorName)){ return; }
    const validators = notModuleRegistratorFields.openFile(validatorName);
    //inject into field.model
    if(!objHas(field.model, 'validate')){
      field.model.validate = [];
    }
    field.model.validate.push(...validators);
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
        nModule,
        lib: fields.FIELDS,  //fields dictionary
        fromPath
      });
    } else {//single file fieldname.js
      const parts = path.parse(fromPath);
      this.registerField({
        nModule,
        name: parts.name, //fields name
        field: fields,       //field description
        fromPath
      });
    }
  }

};

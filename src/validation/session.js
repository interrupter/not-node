const {executeObjectFunction} = require('../common.js');

const emptyFieldsResults = (data)=>{
  return Object.keys(data).reduce((acc, curr)=>{acc[curr] = []; return acc;}, {});
};

module.exports = class FormValidationSession{

  constructor(validators, data){
    this.validators = validators;
    this.data = data;
    this.result = this.getDefaultResult(data);
    return this.validate();
  }

  destroy(){
    delete this.validators;
    delete this.data;
    delete this.result;
  }

  setDirty(){
    this.result.clean = false;
  }

  setFieldError(fieldName, errorMessage){
    if (!Array.isArray(this.result.fields[fieldName])){
      this.result.fields[fieldName] = [];
    }
    if(!this.result.fields[fieldName].includes(errorMessage)){
      this.result.fields[fieldName].push(errorMessage);
    }
    this.setDirty();
  }

  setFormError(errorMessage){
    if (!Array.isArray(this.result.form.errors)){
      this.result.form.errors = [];
    }
    if(!this.result.form.errors.includes(errorMessage)){
      this.result.form.errors.push(errorMessage);
    }
    this.setDirty();
  }

  setFormFieldError(fieldName, errorMessage){
    if (!Array.isArray(this.result.form.fields[fieldName])){
      this.result.form.fields[fieldName] = [];
    }
    if(!this.result.form.fields[fieldName].includes(errorMessage)){
      this.result.form.fields[fieldName].push(errorMessage);
    }
    this.setDirty();
  }

  async validate(){
    await this.fields();
    await this.form();
    return this;
  }

  async fields(){
    for(let t in this.data){
      await this.field(t, this.data[t]);
    }
  }

  async field(fieldName, value){
    const validators = this.getFieldValidators(fieldName);
    return await this.runFieldValidators(fieldName, validators, value);
  }

  async runFieldValidators(fieldName, validators, value){
    for(let validatorRule of validators){
      try{
        const valid = await executeObjectFunction(validatorRule, 'validator', [value]);
        if(!valid){
          this.setFieldError(fieldName, validatorRule.message);
        }
      }catch(e){
        this.setFieldError(fieldName, validatorRule.message);
      }
    }
  }

  getFieldValidators(name){
    return this.validators && this.validators.fields && this.validators.fields[name]?this.validators.fields[name]:[];
  }

  async form(result = {}){
    if(Object.keys(result).length === 0){
      result = {
        fields: {},
        form: {
          fields: {},
          errors:[],
          exceptions: []
        },
      };
    }
    const formValidators = this.validators && this.validators.form?this.validators.form: [];
    await this.runFormValidators(formValidators, result);
  }

  async runFormValidators(formValidators, result){
    for(let validator of formValidators){
      try{
        //checking inside and modifing results inside too
        await validator(this.data, result);
      }catch(e){
        if (!Array.isArray(result.form.exceptions)){
          result.form.exceptions = [];
        }
        result.form.exceptions.push(e);
      }
    }
  }


  getDefaultResult(data){
    return {
      clean: true,
      fields: emptyFieldsResults(data),
      form: {
        fields: emptyFieldsResults(data),
        errors:[]
      },
    };
  }

  getResult(){
    return JSON.stringify(JSON.parse(this.result));
  }

  getCompleteResult(){
    const resultComplete = {
      clear: this.result.form.errors.length === 0,
      fields: {},
      form: []
    };
    for(let fieldName in this.result.fields){
      resultComplete.fields[fieldName] = this.getCompleteResultForField(fieldName);
      if(resultComplete.fields[fieldName].length){
        resultComplete.clear = false;
      }
    }
    resultComplete.form = [...this.result.form.errors];
    return resultComplete;
  }

  getCompleteResultForField(fieldName){
    const fieldResult = [];
    if(Array.isArray(this.result.fields[fieldName])){
      fieldResult.push(...this.result.fields[fieldName]);
    }
    if(Array.isArray(this.result.form.fields[fieldName])){
      fieldResult.push(...this.result.form.fields[fieldName]);
    }
    return fieldResult;
  }

};

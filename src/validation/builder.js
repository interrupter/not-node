const {objHas} = require('../common');
const validator = require('validator');

module.exports = class ValidatorsBuilder {
  constructor(app, getValidatorEnv) {
    this.app = app;
    this.getValidatorEnv = getValidatorEnv;
  }

  destroy(){
    delete this.app;
    delete this.getValidatorEnv;
  }

  /*
  *
validators = {
  fields:{
    [fieldName:string]:[
      {
        validator: 'isUUID',
        message: 'error is no uuid'
      },
      {
        validator: async(val, envVars)=>{

        }
      }
    ]
  }
}
  */
  augmentValidators(validators) {
    if (objHas(validators, 'fields')) {
      for (let fieldName in validators.fields) {
        validators.fields[fieldName] = this.augmentFieldsValidators(validators.fields[fieldName]);
      }
    }
    if (objHas(validators, 'forms')) {
      for (let formName in validators.forms) {
        validators.forms[formName] = this.augmentFormValidators(validators.forms[formName]);
      }
    }
    return validators;
  }

  augmentFieldsValidators(fieldValidators) {
    return fieldValidators.map(field => this.augmentFieldValidator(field));
  }

  augmentFieldValidator(rule) {
    if (rule.validator) {
      if (typeof rule.validator === 'string') {
        return this.augmentFieldValidatorObsolete(rule);
      } else {
        return this.augmentFieldValidatorModern(rule);
      }
    }
    return rule;
  }

  augmentFieldValidatorObsolete(rule) {
    if (validator && objHas(validator, rule.validator)) {
      const validatorName = rule.validator;
      const result = {
        ...rule
      };
      delete result.validator;
      result.validator = (val) => validator[validatorName](val, rule.arguments);
      return result;
    } else {
      return {
        ...rule
      };
    }
  }

  augmentFieldValidatorModern(rule) {
    const ruleValidator = rule.validator;
    const result = {
      ...rule
    };
    delete result.validator;
    result.validator = (val) => ruleValidator(val, this.getValidatorEnv());
    return result;
  }


  augmentFormValidator(rule) {
    return (val, validationResults) => rule(val, validationResults, this.getValidatorEnv());
  }

  augmentFormValidators(rules) {
    return rules.map(rule => this.augmentFormValidator(rule));
  }

};

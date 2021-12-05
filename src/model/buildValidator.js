/** @module Model/Validator */
const validate = require('mongoose-validator');
const {objHas, executeObjectFunction, isFunc} = require('../common');

function extractValidationEnvGetter(options){
  if(options && objHas(options, 'getValidationEnv') && isFunc(options.getValidationEnv)){
    return options.getValidationEnv;
  }else{
    //should return at least empty object
    return ()=>{return {};};
  }
}

function extendObsolete(rule){
  return validate(rule);
}

function extendModern(rule, options){
  const result = {...rule};
  delete result.validator;
  const validationEnv = extractValidationEnvGetter(options)();
  result.validator = async (val) => {
    return await executeObjectFunction(rule, 'validator', [val, validationEnv]);
  };
  return result;
}


function extendValidation(rule, options){
  if(typeof rule.validator === 'string'){
    //will extend from text description to validatejs lib validation function
    return extendObsolete(rule);
  }else{
    //more complex validation
    return extendModern(rule, options);
  }
}

/**
 *  Take array of validator (https://www.npmjs.com/package/validator) rules
 *  and create array of mongoose-validator (https://www.npmjs.com/package/mongoose-validator) rules
 *  then return it
 **/

module.exports = function(validators, options) {
  let result = null;
  result = validators.map(rule => extendValidation(rule, options));
  return result;
};

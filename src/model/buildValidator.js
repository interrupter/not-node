/** @module Model/Validator */
const validate = require('mongoose-validator');

/**
 *  Take array of validator (https://www.npmjs.com/package/validator) rules
 *  and create array of mongoose-validator (https://www.npmjs.com/package/mongoose-validator) rules
 *  then return it
 */

module.exports = function(validators) {
  var result = null;
  result = validators.map((item) => {
    return validate(item);
  });
  return result;
};

/** @module not-node/Error */

const {objHas} = require('./common');
const
  util = require('util'),
  http = require('http');

function HttpError(status, message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, HttpError);
  this.status = status;
  this.message = message || http.STATUS_CODES[status] || 'Error';
}

util.inherits(HttpError, Error);


HttpError.prototype.name = 'HttpError';


module.exports.Http = HttpError;

/**
 *  Пополняем объект ошибок
 *  @param  {object}  errors    errors
 *  @param  {string}  field    name of the field
 *  @param  {object}  error    error to add
 *  @return {object}  modified errors
 */

module.exports.addError = function(errors, field, error) {
  if (!errors) {
    errors = {};
  }
  if (!objHas(errors,field)) {
    errors[field] = [];
  } else {
    if (!Array.isArray(errors[field])) {
      errors[field] = [errors[field]];
    }
  }
  errors[field].push(error);
  return errors;
};

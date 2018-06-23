/** @module Error */

const path = require('path'),
	util = require('util'),
	http = require('http');

function HttpError(status, message){
	Error.apply(this, arguments);
	Error.captureStackTrace(this, HttpError);
	this.status = status;
	this.message = message || http.STATUS_CODES[status] || 'Error';
}

function AjaxError(status, message){
	Error.apply(this, arguments);
	Error.captureStackTrace(this, HttpError);
	this.status = status;
	this.message = message || http.STATUS_CODES[status] || 'Error';
}

util.inherits(HttpError, Error);
util.inherits(AjaxError, Error);

HttpError.prototype.name = 'HttpError';
AjaxError.prototype.name = 'AjaxError';

exports.Http = HttpError;
exports.Ajax = AjaxError;

/**
 *	Пополняем объект ошибок
 *	@param	{object}	errors		errors
 *	@param	{string}	field		name of the field
 *	@param	{object}	error		error to add
 *	@return {object}	modified errors
 */

exports.addError = function(errors, field, error) {
	if (!errors) {
		errors = {};
	}
	if (!errors.hasOwnProperty(field)) {
		errors[field] = [];
	}else{
		if (!Array.isArray(errors[field])) {
			errors[field] = [errors[field]];
		}
	}
	errors[field].push(error);
	return errors;
};

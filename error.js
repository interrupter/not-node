var path = require('path');
var util = require('util');
var http = require('http');

function HttpError(status, message){
	Error.apply(this, arguments);
	Error.captureStackTrace(this, HttpError);
    this.status = status;
	this.message = message || http.STATUS_CODES[status] || "Error";
}

function AjaxError(status, message){
	Error.apply(this, arguments);
	Error.captureStackTrace(this, HttpError);
    this.status = status;
	this.message = message || http.STATUS_CODES[status] || "Error";
}

util.inherits(HttpError, Error);
util.inherits(AjaxError, Error);

HttpError.prototype.name = 'HttpError';
AjaxError.prototype.name = 'AjaxError';

exports.Http = HttpError;
exports.Ajax = AjaxError;

/** @module Model/Enrich */

const Schema = require('mongoose').Schema,
	firstLetterToLower = require('../common').firstLetterToLower,
	buildValidator = require('./buildValidator');

exports.getIncrementalFieldName = function (modelName) {
	return firstLetterToLower(modelName) + 'ID';
};

exports.byFieldsForVersioning = function (objectSchema, modelName) {
	objectSchema.__version = {
		type: Number,
		required: true,
		default: 0
	};
	objectSchema.__latest = {
		type: Boolean,
		required: true,
		default: 0
	};
	objectSchema.__versions = [{
		type: Schema.Types.ObjectId,
		required: false,
		ref: modelName,
		default: []
	}];
	objectSchema.__closed = {
		type: Boolean,
		required: true,
		default: false
	};
	return objectSchema;
};

exports.byFieldsForIncrement = function (objectSchema, modelName) {
	objectSchema[this.getIncrementalFieldName(modelName)] = {
		type: Number,
		required: true,
		searchable: true,
		sortable: true
	};
	return objectSchema;
};


exports.markForIncrement = function (mongooseSchema, modelName) {
	mongooseSchema.statics.__incField = this.getIncrementalFieldName(modelName);
	mongooseSchema.statics.__incModel = modelName;
	return mongooseSchema;
};


exports.markForVersioning = function (mongooseSchema) {
	mongooseSchema.statics.__versioning = true;
	return mongooseSchema;
};

exports.byFieldsValidators = function (mongooseSchema) {
	if (mongooseSchema) {
		for (var fieldName in mongooseSchema) {
			if (mongooseSchema[fieldName].hasOwnProperty('validate')) {
				mongooseSchema[fieldName].validate = buildValidator(mongooseSchema[fieldName].validate);
			}
		}
	}
	return mongooseSchema;
};

/** @module Model/Enrich */

const Schema = require('mongoose').Schema,
  firstLetterToLower = require('../common').firstLetterToLower,
  buildValidator = require('./buildValidator');

class ModelEnricher{
  static getIncrementalFieldName(modelName) {
    return firstLetterToLower(modelName) + 'ID';
  }

  static byFieldsForVersioning(objectSchema, modelName) {
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
  }

  static byFieldsForIncrement(objectSchema, modelName) {
    objectSchema[this.getIncrementalFieldName(modelName)] = {
      type: Number,
      required: true,
      searchable: true,
      sortable: true
    };
    return objectSchema;
  }

  static markForIncrement(mongooseSchema, modelName, options) {
    mongooseSchema.statics.__incField = this.getIncrementalFieldName(modelName);
    mongooseSchema.statics.__incModel = modelName;
    if(options){
      if(options.filter){
        mongooseSchema.statics.__incFilter = options.filter;
      }
    }
    return mongooseSchema;
  }

  static markForVersioning(mongooseSchema) {
    mongooseSchema.statics.__versioning = true;
    return mongooseSchema;
  }

  static byFieldsValidators (mongooseSchema) {
    if (mongooseSchema) {
      for (let fieldName in mongooseSchema) {
        if (Object.prototype.hasOwnProperty.call(mongooseSchema[fieldName], 'validate')) {
          mongooseSchema[fieldName].validate = buildValidator(mongooseSchema[fieldName].validate);
        }
      }
    }
    return mongooseSchema;
  }
}


module.exports = ModelEnricher;

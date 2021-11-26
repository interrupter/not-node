//DB related validation tools
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//not-node
const initFields = require('not-node').Fields.initFields;
const {byFieldsValidators} = require('../model/enrich');
const {notValidationError, notError} = require('not-error');

/**
  * Generic form validation class
  **/
module.exports = class Form{
  constructor({
    FIELDS,
    FORM_NAME
  }){
    this.FORM_NAME = FORM_NAME;
    this.FIELDS = FIELDS;
    this.SCHEMA = byFieldsValidators(initFields(FIELDS, 'model'));
    this.MODEL = mongoose.model(FORM_NAME, Schema(this.SCHEMA));
  }

  /**
  * Extract data from ExpressRequest object and validates it
  * returns it or throws
  * @param {ExpressRequest} req expressjs request object
  * @return {Promise<Object>} form data
  * @throws {notValidationError}
  **/
  async run(req){
    let data = await this.extract(req);
    await this.validate(data);
    return data;
  }

  /**
  * Extracts data, should be overriden
  * @param {ExpressRequest} req expressjs request object
  * @return {Object}        forma data
  **/
  async extract(/*req*/){
    return {};
  }

  /**
  * Validates form data or throws
  * @param {Object} data    form data
  * @return {Object}
  * @throws {notValidationError}
  **/
  async validate(data){
    try{
      await this.MODEL.validate(data, this.FIELDS);
    }catch(e){
      let fields = {};
      if(e instanceof mongoose.Error.ValidationError){
        Object.keys(e.errors).forEach(name => {
          fields[name] = [e.errors[name].message];
        });
        throw new notValidationError(e.message, fields, e, data);
      }else{
        throw new notError(
          'core:form_validation_error',
          {
          FORM_NAME: this.FORM_NAME,
          FIELDS: this.FIELDS,
          data
        },
          e
        );
      }
    }
  }
};

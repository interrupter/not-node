//DB related validation tools
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//not-node
const initFields = require('../fields').initFields;

const FormFabric = require('./fabric');

const {
  byFieldsValidators
} = require('../model/enrich');

const {
  notValidationError,
  notError
} = require('not-error');


/**
 * Generic form validation class
 **/
class Form {
  constructor({
    FIELDS,
    FORM_NAME
  }) {
    this.FORM_NAME = FORM_NAME;
    this.PROTO_FIELDS = FIELDS;
    if (mongoose.modelNames().indexOf(FORM_NAME)===-1){
      this.SCHEMA = byFieldsValidators(initFields(this.PROTO_FIELDS, 'model'));
      this.MODEL = mongoose.model(FORM_NAME, Schema(this.SCHEMA));
    }else{
      this.MODEL = mongoose.connection.model(FORM_NAME);
      this.SCHEMA = this.MODEL.schema;
    }
  }

  getFields(){
    return Object.keys(this.SCHEMA);
  }

  /**
   * Extract data from ExpressRequest object and validates it
   * returns it or throws
   * @param {ExpressRequest} req expressjs request object
   * @return {Promise<Object>} form data
   * @throws {notValidationError}
   **/
  async run(req) {
    let data = await this.extract(req);
    await this._validate(data);
    return data;
  }

  /**
   * Extracts data, should be overriden
   * @param {ExpressRequest} req expressjs request object
   * @return {Object}        forma data
   **/
  async extract( /*req*/ ) {
    return {};
  }

  /**
   * Validates form data or throws
   * @param {Object} data    form data
   * @return {Object}
   * @throws {notValidationError}
   **/
  async _validate(data) {
    try {
      await this.validate(data);
    } catch (e) {
      let fields = {};
      if (e instanceof mongoose.Error.ValidationError) {
        Object.keys(e.errors).forEach(name => {
          fields[name] = [e.errors[name].message];
        });
        throw new notValidationError(e.message, fields, e, data);
      } else if (e instanceof notValidationError){
        throw e;
      }else {
        throw new notError(
          'core:form_validation_error', {
            FORM_NAME: this.FORM_NAME,
            PROTO_FIELDS: this.PROTO_FIELDS,
            FORM_FIELDS: this.getFields(),
            data
          },
          e
        );
      }
    }
  }

  async validate(data){
    await this.MODEL.validate(data, this.getFields());
  }

  static fabric(){
    return FormFabric;
  }
}

module.exports = Form;

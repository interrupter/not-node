const expect = require('chai').expect,
	Schema = require('mongoose').Schema,
	validators = require('./../validators.js'),
	enrich = require('../../src/model/enrich'),
	buildValidator = require('../../src/model/buildValidator'),
	HttpError = require('../../src/error').Http;


module.exports = ()=>{
	describe('Enrich', function () {
		describe('getIncrementalFieldName', function () {
			it('Model to modelID', function () {
				expect(enrich.getIncrementalFieldName('Model')).to.deep.equal('modelID');
			});

			it('model to modelID', function () {
				expect(enrich.getIncrementalFieldName('model')).to.deep.equal('modelID');
			});
		});

		describe('byFieldsForVersioning', function () {
			it('Add versioning', function () {
				var schema = {},
					resultSchema = enrich.byFieldsForVersioning(schema, 'ModelName');
				expect(resultSchema).to.have.keys(['__closed', '__version', '__latest', '__versions']);
				expect(resultSchema.__versions).to.be.an('Array');
				expect(resultSchema.__versions[0].ref).to.be.equal('ModelName');
			});
		});

		describe('byFieldsForIncrement', function () {
			it('Add incremental field', function () {
				var schema = {},
					resultSchema = enrich.byFieldsForIncrement(schema, 'ModelName');
				expect(resultSchema).to.have.key('modelNameID');
			});
		});

		describe('markForIncrement', function () {
			it('Mark, without options', function () {
				const schema = {
						statics: {}
					},
					resultSchema = enrich.markForIncrement(schema, 'ModelName');
				expect(resultSchema.statics).to.have.keys(['__incField', '__incModel']);
				expect(resultSchema.statics.__incField).to.be.equal('modelNameID');
				expect(resultSchema.statics.__incModel).to.be.equal('ModelName');
			});

			it('Mark, with options', function () {
				const schema = {
						statics: {}
					},
					options = {
						filter: {ownerId: 1}
					},
					resultSchema = enrich.markForIncrement(schema, 'ModelName', options);
				expect(resultSchema.statics).to.have.keys(['__incField', '__incModel', '__incFilter']);
				expect(resultSchema.statics.__incField).to.be.equal('modelNameID');
				expect(resultSchema.statics.__incModel).to.be.equal('ModelName');
				expect(resultSchema.statics.__incFilter).to.be.deep.equal(options.filter);
			});
		});

		describe('markForVersioning', function () {
			it('Mark', function () {
				var schema = {
						statics: {}
					},
					resultSchema = enrich.markForVersioning(schema, 'ModelName');
				expect(resultSchema.statics).to.have.keys(['__versioning']);
				expect(resultSchema.statics.__versioning).to.be.true;
			});
		});

		describe('byFieldsValidators', function () {
			it('model to modelID', function () {
				const schema = {
					name: {
						validate: validators.title
					}
				};
				const res = enrich.byFieldsValidators(schema);
				expect(res.name.validate).to.have.lengthOf(1);
				expect(res.name.validate[0]).to.have.keys(['validator', 'message']);
				expect(res.name.validate[0].message).to.deep.equal(validators.title[0].message);
			});

			it('model to modelID, mongooseSchema is not defined', function () {
				expect(enrich.byFieldsValidators(null)).to.be.equal(null);
			});
		});

	});

};

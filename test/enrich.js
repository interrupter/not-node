const expect = require("chai").expect,
	Schema = require('mongoose').Schema,
	validators = require('./validators.js'),
	enrich = require("../src/model/enrich"),
	buildValidator = require("../src/model/buildValidator"),
	HttpError = require('../src/error').Http;

describe("Enrich", function () {
	describe("getIncrementalFieldName", function () {
		it("Model to modelID", function () {
			expect(enrich.getIncrementalFieldName('Model')).to.deep.equal('modelID');
		});

		it("model to modelID", function () {
			expect(enrich.getIncrementalFieldName('model')).to.deep.equal('modelID');
		});
	});

	describe("byFieldsForVersioning", function () {
		it("Add versioning", function () {
			var schema = {},
				resultSchema = enrich.byFieldsForVersioning(schema, 'ModelName');
			expect(resultSchema).to.have.keys(['__closed', '__version', '__latest', '__versions']);
			expect(resultSchema.__versions).to.be.an.Array;
			expect(resultSchema.__versions[0].ref).to.be.equal('ModelName');
		});
	});

	describe("byFieldsForIncrement", function () {
		it("Add incremental field", function () {
			var schema = {},
				resultSchema = enrich.byFieldsForIncrement(schema, 'ModelName');
			expect(resultSchema).to.have.key('modelNameID');
		});
	});

	describe("markForIncrement", function () {
		it("Mark", function () {
			var schema = {
					statics: {}
				},
				resultSchema = enrich.markForIncrement(schema, 'ModelName');
			expect(resultSchema.statics).to.have.keys(['__incField', '__incModel']);
			expect(resultSchema.statics.__incField).to.be.equal('modelNameID');
			expect(resultSchema.statics.__incModel).to.be.equal('ModelName');
		});
	});

	describe("markForVersioning", function () {
		it("Mark", function () {
			var schema = {
					statics: {}
				},
				resultSchema = enrich.markForVersioning(schema, 'ModelName');
			expect(resultSchema.statics).to.have.keys(['__versioning']);
			expect(resultSchema.statics.__versioning).to.be.true;
		});
	});

	describe("byFieldsValidators", function () {
		it("model to modelID", function () {
			var schema = {
				name: {
					validate: validators.title
				}
			};
			var schema = enrich.byFieldsValidators(schema);
			expect(schema.name.validate).to.have.lengthOf(1);
			expect(schema.name.validate[0]).to.have.keys(['validator', 'message']);
			expect(schema.name.validate[0].message).to.deep.equal(validators.title[0].message);
		});
	});

});

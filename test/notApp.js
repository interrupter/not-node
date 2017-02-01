const expect = require("chai").expect,
	HttpError = require('../src/error').Http,
	testie = require("../src/app"),
	routesPath = __dirname + '/routes',
	modulesPath = __dirname + '/modules';

describe("noApp", function() {

	describe("Constructor", function() {
		it("With options", function() {
			var app = new testie({someOption: true});
			expect(app.options).to.deep.equal({someOption: true});
			expect(app.modules).to.deep.equal({});
		});
	});

	describe("importModulesFrom", function() {
		it("TODO", function() {
			var app = new testie();
			expect(true).to.deep.equal(true);
		});
	});

	describe("importModuleFrom", function() {
		it("TODO", function() {
			expect(true).to.deep.equal(true);
		});
	});

	describe("importModule", function() {
		it("TODO", function() {
			expect(true).to.deep.equal(true);
		});
	});

	describe("getManifest", function() {
		it("TODO", function() {
			expect(true).to.deep.equal(true);
		});
	});

	describe("getModel", function() {
		it("TODO", function() {
			expect(true).to.deep.equal(true);
		});
	});

	describe("Expose", function() {
		it("TODO", function() {
			expect(true).to.deep.equal(true);
		});
	});

});

const expect = require("chai").expect,
	HttpError = require('../src/error').Http,
	notModule = require("../src/manifest/module"),
	mongoose = require('mongoose'),
	increment = require("../src/model/increment"),
	validators = require('./validators'),
	modulesPath = __dirname + '/modules',
	modulePath = __dirname + '/module';
return;
const moduleManifest = {
	'file': {
		model: 'file',
		url: '/api/:modelName',
		actions: {
			list: {
				method: 'get',
				rules: [{
					admin: true
				}]
			}
		}
	}
};

describe("notModule", function () {
	before(function (done) {
		mongoose.disconnect((err) => {
			done(err);
		});
	});
	beforeEach(function (done) {
		mongoose.connect('mongodb://localhost/test', function (err) {
			increment.init(mongoose);
			done(err);
		});
	});

	describe("constructor", function () {
		it("With init from path", function () {
			var mod = new notModule({
				modPath: modulePath,
				mongoose: mongoose
			});
			expect(mod.faulty).to.deep.equal(false);
			expect(mod.path).to.deep.equal(modulePath);
			expect(mod.models).to.have.any.keys(['UserLocal']);
			expect(mod.routes).to.have.key('file');
			expect(mod.getModel('UserLocal')).to.be.ok;
		});

		it("With init from module", function () {
			var mod = new notModule({
				modObject: require('./module'),
				mongoose: mongoose
			});
			expect(mod.faulty).to.deep.equal(false);
			expect(mod.models).to.have.any.keys(['UserLocal']);
			expect(mod.routes).to.have.key('file');
			expect(mod.getModel('UserLocal')).to.be.ok;
		});

	});

	describe("getManifest", function () {
		it("Get module manifest", function () {
			var mod = new notModule({
				modObject: require('./module'),
				mongoose: mongoose
			});
			expect(mod.getManifest()).to.deep.equal(moduleManifest);
		});
	});

	afterEach(function (done) {
		mongoose.disconnect((err) => {
			done(err);
		});
	});

});

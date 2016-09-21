const expect = require("chai").expect,
	mongoose = require('mongoose'),
	increment = require("../src/model/increment"),
	validators = require('./validators'),
	remember = require('./remember'),
	proto = require("../src/model/proto");

describe("Model/Proto", function() {
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			increment.init(mongoose);
			done(err);
		});
	});

	it("extractVariants", () => {
		var items = [{
				getVariant: () => {
					return 'variant';
				}
			}, {
				getVariant: () => {
					return 'variant 2';
				}
			}],
			result = proto.extractVariants(items);
		expect(result).to.have.lengthOf(2);
		expect(result[0]).to.be.equal('variant');
		expect(result[1]).to.be.equal('variant 2');
	});

	it("fabricate with options", function() {
		var moduleProto1 = {
			exports: {
				thisSchema: {
					name: {
						type: String,
						required: true,
						validate: validators.title
					},
					default: {
						type: Boolean,
						required: true,
					}
				},
				thisModelName: 'User1',
				thisMethods: {
					getName: function() {
						return this.name + ' 1';
					}
				},
				thisStatics: {
					returnFalse: () => {
						return false;
					}
				},
				enrich: {
					versioning: true,
					increment: true,
					validators: true,
				}
			}
		};
		proto.fabricate(moduleProto1, {}, mongoose)
		expect(moduleProto1.exports.User1).to.exist;
		expect(moduleProto1.exports.User1.returnFalse()).to.be.false;
		var item = new moduleProto1.exports.User1({
			name: 'val'
		});
		expect(item.getName()).to.be.equal('val 1');
		expect(moduleProto1.exports.mongooseSchema.statics).to.have.keys(['saveVersion', '__versioning', '__incModel', '__incField', 'returnFalse', 'sanitizeInput', 'getOne', 'getOneByID', 'getOneRaw', 'list', 'addNew', 'listAll']);
		expect(moduleProto1.exports.mongooseSchema.methods).to.have.keys(['getName', 'getID']);
	});

	var moduleProto = {
		exports: {
			thisSchema: {
				username: {
					type: String,
					required: true,
					validate: validators.title
				},
				default: {
					type: Boolean,
					required: true,
				}
			},
			thisModelName: 'User',
			thisMethods: {

			},
			thisStatics: {

			},
			enrich: {
				versioning: true,
				increment: true,
				validators: true,
			}
		}
	};

	it("fabricate without options", function() {
		proto.fabricate(moduleProto, null, mongoose);
		expect(moduleProto.exports.User).to.exist;
	});

	var savedItem = null;

	describe("Model/Proto/Statics", function() {
		beforeEach(function(done){
			var d = new Date().getTime();
			moduleProto.exports.User.addNew({
				username: 'tester ' + Math.random() + d,
				default: false
			}, function(item) {
				expect(item).to.exist;
				if (item){
					remember.save('item', item);
					savedItem = item;
				}
				done();
			},
			function(err, reports) {
				expect(err).to.not.exist;
				done();
			});
		});

		it("sanitizeInput", function() {
			var sanitized = moduleProto.exports.User.sanitizeInput({});
			expect(sanitized).to.deep.equal({
				default: false
			});
		});

		it("addNew", function(done) {
			moduleProto.exports.User.addNew({
				username: 'notTester',
				default: false
			}, function(item) {
				expect(item).to.exist;
				expect(item.username).to.be.equal('notTester');
				done();
			},
			done);
		});

		it("getOne", function(done) {
			moduleProto.exports.User.getOne(remember.load('item')._id, function(err, item) {
				if (err) done(err);
				expect(item.username).to.be.equal(savedItem.username);
				done();
			});
		});

		it("getOneByID", function(done) {
			moduleProto.exports.User.getOneByID(remember.load('item').getID(), function(err, item) {
				if (err) done(err);
				expect(item.username).to.be.equal(savedItem.username);
				done();
			});
		});

		it("getOneRaw", function(done) {
			moduleProto.exports.User.getOneRaw(remember.load('item')._id, function(err, item) {
				if (err) done(err);
				expect(item.username).to.be.equal(savedItem.username);
				done();
			});
		});

		it("list", function(done) {
			moduleProto.exports.User.list(0, 10,  {
	            '_id': 1
	        }, [{default: false}], function(err, sitems) {
				if (err) done(err);
				expect(sitems).to.exist;
				expect(sitems).to.have.lengthOf(1);
				done();
			});
		});

		it("listAll", function(done) {
			moduleProto.exports.User.listAll(function(err, sitems) {
				if (err) done(err);
				expect(sitems).to.exist;
				expect(sitems).to.have.lengthOf(1);
				done();
			});
		});

		afterEach(function(done){
			moduleProto.exports.User.remove({}, function(){
				done();
			});
		});
	});

	after(function(done) {
		mongoose.disconnect((err) => {
			done(err);
		});
	});

});

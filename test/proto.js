const expect = require('chai').expect,
	mongoose = require('mongoose'),
	increment = require('../src/model/increment'),
	validators = require('./validators'),
	remember = require('./remember'),
	proto = require('../src/model/proto'),
	defaultModel = require('../src/model/default');

describe('Model/Proto', function () {
	before(function (done) {
		mongoose.connect('mongodb://localhost/test', function (err) {
			increment.init(mongoose);
			done(err);
		});
	});

	it('extractVariants', () => {
		var items = [{
				getVariant: () => {
					return 'variant';
				}
			}, {
				getVariant: () => {
					return 'variant 2';
				}
			}],
			result = defaultModel.extractVariants(items);
		expect(result).to.have.lengthOf(2);
		expect(result[0]).to.be.equal('variant');
		expect(result[1]).to.be.equal('variant 2');
	});

	it('fabricate with options', function () {
		var moduleProto1 = {
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
				getName: function () {
					return this.name + ' 1';
				}
			},
			thisStatics: {
				returnFalse: () => false
			},
			enrich: {
				versioning: true,
				increment: true,
				validators: true,
			}
		};
		proto.fabricate(moduleProto1, {}, mongoose);
		expect(moduleProto1.User1).to.exist;
		expect(moduleProto1.User1.returnFalse()).to.be.false;
		var item = new moduleProto1.User1({
			name: 'val'
		});
		expect(item.getName()).to.be.equal('val 1');
		expect(moduleProto1.mongooseSchema.statics).to.have.keys(['saveVersion', '__versioning', '__incModel', '__incField', 'returnFalse', 'sanitizeInput', 'getOne', 'getOneByID', 'getOneRaw', 'list', 'listAndPopulate', 'add', 'listAll', 'listAllAndPopulate']);
		expect(moduleProto1.mongooseSchema.methods).to.have.keys(['getName', 'getID', 'close']);
	});

	var moduleProto = {
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
	};

	it('fabricate without options', function () {
		proto.fabricate(moduleProto, null, mongoose);
		expect(moduleProto.User).to.exist;
	});

	var savedItem = null;

	describe('Model/Proto/Statics', function () {
		beforeEach(function (done) {
			var d = new Date().getTime();
			moduleProto.User.add({
				username: 'tester ' + Math.random() + d,
				default: false
			})
				.then((item) => {
					expect(item).to.exist;
					if (item) {
						remember.save('item', item);
						savedItem = item;
					}
					done();
				})
				.catch((err) => {
					expect(err).to.not.exist;
					done();
				});

		});

		it('sanitizeInput', function () {
			var sanitized = moduleProto.User.sanitizeInput({});
			expect(sanitized).to.deep.equal({
				default: false
			});
		});

		it('add', function (done) {
			moduleProto.User.add({
				username: 'notTester',
				default: false
			})
				.then((item) => {
					expect(item).to.exist;
					expect(item.username).to.be.equal('notTester');
					done();
				})
				.catch(done);
		});

		it('getOne', function (done) {
			moduleProto.User.getOne(remember.load('item')._id)
				.then((item)=>{
					expect(item.username).to.be.equal(savedItem.username);
					done();
				})
				.catch(done);
		});

		it('getOneByID', function (done) {
			moduleProto.User.getOneByID(remember.load('item').getID())
				.then((item)=>{
					expect(item.username).to.be.equal(savedItem.username);
					done();
				})
				.catch(done);
		});

		it('getOneRaw', function (done) {
			moduleProto.User.getOneRaw(remember.load('item')._id)
				.then((item)=>{
					expect(item.username).to.be.equal(savedItem.username);
					done();
				})
				.catch(done);
		});

		it('list', function (done) {
			moduleProto.User.list(0, 10, {
				'_id': 1
			}, [{
				default: false
			}])
				.then((sitems)=>{
					expect(sitems).to.exist;
					expect(sitems).to.have.lengthOf(1);
					done();
				})
				.catch(done);
		});

		it('listAll', function (done) {
			moduleProto.User.listAll()
				.then((sitems)=>{
					expect(sitems).to.exist;
					expect(sitems).to.have.lengthOf(1);
					done();
				})
				.catch(done);
		});

		afterEach(function (done) {
			moduleProto.User.remove({})
				.then(()=>{done();})
				.catch(done);
		});
	});

	after(function (done) {
		mongoose.disconnect((err) => {
			done(err);
		});
	});

});

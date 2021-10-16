const expect = require('chai').expect,
	mongoose = require('mongoose'),
	increment = require('../src/model/increment'),
	validators = require('./validators'),
	remember = require('./remember'),
	proto = require('../src/model/proto'),
	defaultModel = require('../src/model/default'),
	{ MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

describe('Model/Proto', function () {
	before( (done) => {
		MongoMemoryServer.create()
		 .then((mongodi)=>{
			 mongod = mongodi;
			 let uri = mongod.getUri();
	     mongoose.connect(uri, (err) => {
	       if (err) {
	         console.error(err);
	         done(err);
	       } else {
          increment.init(mongoose);
	        done();
	       }
	     });
		 });
	});

	it('isIgnored, set to TRUE', () => {
		let targetModule = {
			IGNORE: true
		},
			result = proto.isIgnored(targetModule);
		expect(result).to.be.true;
	});

	it('isIgnored, set to TRUE', () => {
		let targetModule = {
			IGNORE: false
		},
			result = proto.isIgnored(targetModule);
		expect(result).to.be.false;
	});

	it('initOptions, targetModule.schemaOptions is set, but options is NULL', () => {
		let targetModule = {
			schemaOptions: {
				foor: 'bar'
			}
		},
			result = proto.initOptions(null, targetModule);
		expect(result.schemaOptions).to.exist;
		expect(result.schemaOptions.foor).to.be.equal('bar');
	});

	it('initOptions, targetModule.schemaOptions is set, but options is NULL', () => {
		let targetModule = {
			schemaOptions: {
				foor: 'bar'
			}
		},
			options = {
				schemaOptions:{legacy: 'instruction'}
			},
			result = proto.initOptions(options, targetModule);
		expect(result.schemaOptions).to.exist;
		expect(result.schemaOptions.foor).to.be.equal('bar');
	});


	it('extendBySource, targetModule full', () => {
		let schema = {
			methods: {
				secure(){}
			},
			statics: {
				insecure(){}
			},
			virtual(l){
				expect(l).to.be.equal('neo');
				return {
					get(){
						return {set(){}};
					}
				};
			},
			pre(key, l){
				expect(key).to.be.equal('update');
				expect(l(2)).to.be.equal(4);
			},
			post(key, l){
				expect(key).to.be.equal('update');
				expect(l(2)).to.be.equal(1);
			},
		};
		let targetModule = {
			thisMethods: {
				foo(){}
			},
			thisStatics: {
				bar(){}
			},
			thisVirtuals: {
				neo:{
					get(){},
					set(){}
				}
			},
			thisPre: {
				update(n){return n*2;},
			},
			thisPost: {
				update(n){return n/2;},
			},
		};
		proto.extendBySource(schema, targetModule);
		expect(schema.methods).to.have.keys(['secure','foo']);
		expect(schema.statics).to.have.keys(['insecure','bar']);
	});

	it('extendBySource, targetModule not full, different structure of virtuals', () => {
		let schema = {
			methods: {
				secure(){}
			},
			statics: {
				insecure(){}
			},
			virtual(l){
				expect(l).to.be.equal('neo');
			},
			pre(key, l){
				expect(key).to.be.equal('update');
				expect(l(2)).to.be.equal(4);
			},
			post(key, l){
				expect(key).to.be.equal('update');
				expect(l(2)).to.be.equal(1);
			},
		};
		let targetModule = {
			thisVirtuals: {
				neo(){}
			},
			thisPre: {
				update(n){return n*2;},
			},
			thisPost: {
				update(n){return n/2;},
			},
		};
		proto.extendBySource(schema, targetModule);
		expect(schema.methods).to.have.keys(['secure']);
		expect(schema.statics).to.have.keys(['insecure']);
	});


	it('enrichByFields, enrich not exist', () => {
		let targetModule = {};
		proto.enrichByFields(targetModule);
		expect(targetModule).to.be.deep.equal({});
	});

	it('enrichByFields, enrich not filled', () => {
		let targetModule = {
			enrich:{}
		};
		proto.enrichByFields(targetModule);
		expect(targetModule).to.be.deep.equal({enrich:{}});
	});


	it('extractVariants', () => {
		let items = [{
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
		let moduleProto1 = {
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
		let item = new moduleProto1.User1({
			name: 'val'
		});
		expect(item.getName()).to.be.equal('val 1');
		expect(moduleProto1.mongooseSchema.statics).to.have.keys(['saveVersion', '__versioning', '__incModel', '__incField', 'returnFalse', 'sanitizeInput', 'getOne', 'getOneByID', 'getOneRaw', 'makeQuery', 'list', 'countWithFilter', 'listAndPopulate', 'add', 'update', 'listAll', 'listAllAndPopulate', 'listAndCount', 'listByField']);
		expect(moduleProto1.mongooseSchema.methods).to.have.keys(['getName', 'getID', 'close']);
	});

	let moduleProto = {
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

	let savedItem = null;

	describe('Model/Proto/Statics', function () {
		beforeEach(function (done) {
			let d = new Date().getTime();
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
			let sanitized = moduleProto.User.sanitizeInput({});
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
			moduleProto.User.deleteMany({})
				.then(()=>{done();})
				.catch(done);
		});

	});

	after(function (done) {
		mongoose.disconnect(async () => {
			try{
				await mongod.stop();
				done();
			}catch(e){
				done(e)
			}
		});

	});

});

const expect = require('chai').expect,
	mongoose = require('mongoose'),
	fabricateModel = require('../src/model/proto').fabricate,
	userProto = require('./module/models/user.js'),
	increment = require('../src/model/increment.js'),
	plainProto = require('./module/models/plainModel.js'),
	routine = require('../src/model/routine'),
	{ MongoMemoryServer } = require('mongodb-memory-server');


	var mongod = null;

describe('Model/Routine', function () {
	before( (done) => {
		mongod = new MongoMemoryServer();
		mongod.getUri()
			.then((uri)=>{
				mongoose.connect(uri, (err) => {
					if(err){
						console.error(err);
						done(err);
					}else{
						increment.init(mongoose);
						fabricateModel(userProto, null, mongoose);
						fabricateModel(plainProto, null, mongoose);
						done();
					}
				});
			})
			.catch(done);
	});

	it('returnErrors', function (done) {
		var err = routine.returnErrors({
			errors: {
				fieldName: {
					message: 'message'
				}
			}
		}, function (err, report) {
			expect(report).to.have.keys(['fieldName']);
			expect(report.fieldName).to.be.equal('message');
			done();
		});
	});

	it('addWithoutVersion', function (done) {
		var PlainModel = plainProto.PlainModel;
		routine.addWithoutVersion(PlainModel, {
			name: 'User name 1',
			price: 10
		})
			.then((item) => {
				expect(item).to.exist;
				expect(item.plainModelID).to.not.exist;
				expect(item.name).to.be.equal('User name 1');
				done();
			})
			.catch((err, report) => {
				expect(err).to.not.exist;
				done();
			});
	});

	it('addWithoutVersion with validation error', function (done) {
		var PlainModel = plainProto.PlainModel;
		routine.addWithoutVersion(PlainModel, {
			name: 'User name 1'
		})
			.then((item) => {
				expect(item).to.not.exist;
				done();
			})
			.catch((err, report) => {
				expect(err).to.exist;
				expect(err.errors).to.have.key('price');
				done();
			});
	});

	it('addWithVersion', function (done) {
		var User = userProto.UserLocal;
		routine.addWithVersion(User, {
			name: 'User name 1',
			userLocalID: 1,
			price: 10
		})
			.then((item) => {
				expect(item).to.exist;
				expect(item.userLocalID).to.exist;
				expect(item.__latest).to.exist;
				expect(item.name).to.be.equal('User name 1');
				done();
			})
			.catch((err, report) => {
				expect(err).to.not.exist;
				done();
			});
	});

	it('addWithVersion with validation error', function (done) {
		var User = userProto.UserLocal;
		routine.addWithVersion(User, {
			name: 'User name 1',
			price: 10
		})
			.then((item) => {
				expect(item).to.not.exist;
				done();
			})
			.catch((err, report) => {
				expect(err).to.exist;
				expect(err.errors).to.have.key('userLocalID');
				done();
			});
	});

	it('add - versioning OFF', function (done) {
		var PlainModel = plainProto.PlainModel;
		routine.add(PlainModel, {
			name: 'User name 1',
			price: 10
		})
			.then((item) => {
				expect(item).to.exist;
				expect(item.plainModelID).to.not.exist;
				expect(item.name).to.be.equal('User name 1');
				done();
			})
			.catch((err, report) => {
				expect(err).to.not.exist;
				done();
			});
	});

	it('add - versioning ON, ID=1', function (done) {
		var User = userProto.UserLocal;
		expect(userProto.mongooseSchema.methods).to.have.keys(['close', 'getID']);
		routine.add(User, {
			name: 'User name 1',
			price: 10
		})
			.then((item) => {
				expect(item).to.exist;
				expect(item.userLocalID).to.exist;
				expect(item.getID()).to.be.equal(1);
				expect(item.__latest).to.exist;
				expect(item.name).to.be.equal('User name 1');
				done();
			})
			.catch((err, report) => {
				expect(err).to.not.exist;
				done();
			});
	});

	it('add - versioning ON, ID=2', function (done) {
		var User = userProto.UserLocal;
		routine.add(User, {
			name: 'User name 12',
			price: 11
		})
			.then((item) => {
				expect(item).to.exist;
				expect(item.userLocalID).to.exist;
				expect(item.getID()).to.be.equal(2);
				expect(item.__latest).to.exist;
				expect(item.name).to.be.equal('User name 12');
				done();
			})
			.catch((err, report) => {
				expect(err).to.not.exist;
				done();
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

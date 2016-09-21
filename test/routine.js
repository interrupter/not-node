const expect = require("chai").expect,
    mockgoose = require('mockgoose'),
    mongoose = require('mongoose'),
    fabricateModel = require('../src/model/proto').fabricate,
    userProto = require('./module/model/user.js'),
	increment = require('../src/model/increment.js'),
    plainProto = require('./module/model/plainModel.js'),
    routine = require("../src/model/routine");

describe("Model/Routine", function() {
    before(function(done) {
        mockgoose(mongoose).then(function() {
            mongoose.connect('mongodb://localhost/test', function(err) {
                increment.init(mongoose);
				fabricateModel(userProto, null, mongoose);
                fabricateModel(plainProto, null, mongoose);
                done(err);
            });
        });
    });

    it("returnErrors", function(done) {
        var err = routine.returnErrors({
            errors: {
                fieldName: {
                    message: 'message'
                }
            }
        }, function(err, report) {
            expect(report).to.have.keys(['fieldName']);
            expect(report.fieldName).to.be.equal('message');
            done();
        });
    });

    it("addWithoutVersion", function(done) {
        var PlainModel = plainProto.PlainModel;
        routine.addWithoutVersion(PlainModel, {
            name: 'User name 1',
            price: 10
        }, function(item) {
            expect(item).to.exist;
            expect(item.plainModelID).to.not.exist;
            expect(item.name).to.be.equal('User name 1');
            done();
        }, function(err, report) {
            expect(err).to.not.exist;
            done();
        });
    });

    it("addWithoutVersion with validation error", function(done) {
        var PlainModel = plainProto.PlainModel;
        routine.addWithoutVersion(PlainModel, {
            name: 'User name 1'
        }, function(item) {
            expect(item).to.not.exist;
            done();
        }, function(err, report) {
            expect(err).to.exist;
            expect(err.errors).to.have.key('price');
            done();
        });
    });

    it("addWithVersion", function(done) {
		var User = userProto.UserLocal;
        routine.addWithVersion(User, {
            name: 'User name 1',
			userLocalID: 1,
            price: 10
        }, function(item) {
            expect(item).to.exist;
            expect(item.userLocalID).to.exist;
			expect(item.__latest).to.exist;
            expect(item.name).to.be.equal('User name 1');
            done();
        }, function(err, report) {
            expect(err).to.not.exist;
            done();
        });
    });

	it("addWithVersion with validation error", function(done) {
		var User = userProto.UserLocal;
        routine.addWithVersion(User, {
            name: 'User name 1',
            price: 10
        }, function(item) {
            expect(item).to.not.exist;
            done();
        }, function(err, report) {
			expect(err).to.exist;
            expect(err.errors).to.have.key('userLocalID');
            done();
        });
    });

    it("addNew - versioning OFF", function(done) {
		var PlainModel = plainProto.PlainModel;
		routine.add(PlainModel, {
			name: 'User name 1',
			price: 10
		}, function(item) {
			expect(item).to.exist;
			expect(item.plainModelID).to.not.exist;
			expect(item.name).to.be.equal('User name 1');
			done();
		}, function(err, report) {
			expect(err).to.not.exist;
			done();
		});
    });

	it("addNew - versioning ON, ID=1", function(done) {
		var User = userProto.UserLocal;
		expect(userProto.mongooseSchema.methods).to.have.keys('getID');
		routine.add(User, {
			name: 'User name 1',
			price: 10
		}, function(item) {
			expect(item).to.exist;
			expect(item.userLocalID).to.exist;
			expect(item.getID()).to.be.equal(1);
			expect(item.__latest).to.exist;
			expect(item.name).to.be.equal('User name 1');
			done();
		}, function(err, report) {
			expect(err).to.not.exist;
			done();
		});
    });

	it("addNew - versioning ON, ID=2", function(done) {
		var User = userProto.UserLocal;
		routine.add(User, {
			name: 'User name 12',
			price: 11
		}, function(item) {
			expect(item).to.exist;
			expect(item.userLocalID).to.exist;
			expect(item.getID()).to.be.equal(2);
			expect(item.__latest).to.exist;
			expect(item.name).to.be.equal('User name 12');
			done();
		}, function(err, report) {
			expect(err).to.not.exist;
			done();
		});
    });

    after(function(done) {
        mongoose.disconnect((err) => {
            done(err);
        });
		mockgoose.reset();
    });
});
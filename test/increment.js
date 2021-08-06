const expect = require('chai').expect,
  should = require('chai').should(),
  mongoose = require('mongoose'),
  increment = require('../src/model/increment'),
  HttpError = require('../src/error').Http,
  {
    MongoMemoryServer
  } = require('mongodb-memory-server');

var mongod = null;

describe('Increment', function() {
  before((done) => {
    MongoMemoryServer.create()
		 .then((mongodi)=>{
			 mongod = mongodi;
			 let uri = mongod.getUri();
	     mongoose.connect(uri, (err) => {
	       if (err) {
	         console.error(err);
	         done(err);
	       } else {
	         done();
	       }
	     });
		 });
  });

  it('before init', function() {
    expect(increment.next).to.not.exist;
    expect(increment.model).to.not.exist;
  });

  it('after init', function() {
    var res = increment.init(mongoose);
    expect(increment.next).to.exist;
    expect(increment.model).to.exist;
  });

  it('getNext, first time', function(done) {
    var ifOk = function(nextID) {
        expect(nextID).to.deep.equal(1);
        done();
      },
      ifFailure = function(err) {
        done(err);
      },
      res = increment.next('modelName')
      .then(ifOk)
      .catch(ifFailure);
  });

  it('getNext, second time', function(done) {
    var ifOk = function(nextID) {
        expect(nextID).to.deep.equal(2);
        done();
      },
      ifFailure = function(err) {
        done(err);
      },
      res = increment.next('modelName')
      .then(ifOk)
      .catch(ifFailure);
  });

  it('init, second time', function() {
    increment.init(mongoose);
    expect(increment.next).to.exist;
    expect(increment.model).to.exist;
  });

  it('getNext, with error', function(done) {
    var ifOk = function(nextID) {
        done();
      },
      ifFailure = function(err) {
        expect(err).to.exist;
        done();
      },
      res = increment.next({
        some: 1,
        object: 2
      })
      .then(ifOk)
      .catch(ifFailure);
  });

  after(function(done) {
    mongoose.disconnect(async () => {
      try {
        await mongod.stop();
        done();
      } catch (e) {
        done(e)
      }
    });

  });
});

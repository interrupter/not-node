const expect = require('chai').expect,
  HttpError = require('../src/error').Http,
  notModule = require('../src/manifest/module'),
  mongoose = require('mongoose'),
  increment = require('../src/model/increment'),
  validators = require('./validators'),
  modulesPath = __dirname + '/modules',
  modulePath = __dirname + '/module',
  {
    MongoMemoryServer
  } = require('mongodb-memory-server');

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

var mongod = null;

describe('notModule', function() {
  before((done) => {
    mongod = new MongoMemoryServer();
    mongod.getUri()
      .then((uri) => {
        mongoose.connect(uri, (err) => {
          if (err) {
            console.error(err);
            done(err);
          } else {
            increment.init(mongoose);
            done();
          }
        });
      })
      .catch(done);
  });

  describe('constructor', function() {
    it('With init from path', function() {
      var mod = new notModule({
        modPath: modulePath,
        mongoose: mongoose
      });
      mod.fabricateModels();
      expect(mod.faulty).to.deep.equal(false);
      expect(mod.path).to.deep.equal(modulePath);
      expect(mod.models).to.have.any.keys(['UserLocal']);
      expect(mod.routes).to.have.key('file');
      let model = mod.getModel('UserLocal');
      expect(model).to.be.ok;
    });

    it('With init from module', function() {
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

  describe('getManifest', function() {
    it('Get module manifest', function() {
      var mod = new notModule({
        modObject: require('./module'),
        mongoose: mongoose
      });
      expect(mod.getManifest()).to.deep.equal(moduleManifest);
    });
  });

  describe('getModuleName', function() {
    it('Get module name from module.exports.name', function() {
      var mod = new notModule({
        modObject: require('./module'),
        mongoose: mongoose
      });
      expect(mod.getModuleName()).to.be.equal('not-post');
    });
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

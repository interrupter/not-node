const expect = require('chai').expect,
  mongoose = require('mongoose'),
  increment = require('../src/model/increment'),
  ModelFabricate = require('../src/model/proto'),
  ModelVersioning = require('../src/model/versioning'),
  validators = require('./validators'),
  {
    MongoMemoryServer
  } = require('mongodb-memory-server');

let mongod = null;
let modelProto = {
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
  thisModelName: 'Document',
  thisMethods: {},
  thisStatics: {},
  enrich: {
    versioning: true,
    increment: true,
    validators: true,
  }
};

describe('Versioning', function() {
  before((done) => {
    MongoMemoryServer.create()
      .then((mongodi) => {
        mongod = mongodi;
        let uri = mongod.getUri();
        mongoose.connect(uri, (err) => {
          if (err) {
            console.error(err);
            done(err);
          } else {
            increment.init(mongoose);
            ModelFabricate.fabricate(modelProto, {}, mongoose);
            done();
          }
        });
      });
  });

  describe('extractVersionNumber', function() {
    it('version exist', function() {
      const a = {
        __version: 2,
      };
      const b = ModelVersioning.extractVersionNumber(a);
      expect(b).to.deep.equal(2);
    });

    it('version doesnt exist, goes with default = 0', function() {
      const a = {
      };
      const b = ModelVersioning.extractVersionNumber(a);
      expect(b).to.deep.equal(0);
    });
  });

  describe('stripTechData', function() {
    it('remove fields, with deletable', function() {
      const dt = new Date();
      const a = {
        a: 'f',
        b: 2,
        c: dt,
        d: ['f'],
        _id: '345weqrwqer234',
        __version: 2,
        __versions: [],
        __v: 2,
        __latest: true
      };
      const a_clean = {
        a: 'f',
        b: 2,
        c: dt,
        d: ['f']
      };
      const b = ModelVersioning.stripTechData(a);
      expect(b).to.deep.equal(a_clean);
    });

    it('remove fields, without deletable', function() {
      const dt = new Date();
      const a = {
        a: 'f',
        b: 2,
        c: dt,
        d: ['f']
      };
      const a_clean = {
        a: 'f',
        b: 2,
        c: dt,
        d: ['f']
      };
      const b = ModelVersioning.stripTechData(a);
      expect(b).to.deep.equal(a_clean);
    });
  });

  describe('isThisDocsDifferent', function() {
    it('identical', function() {
      const dt = new Date();
      const a = {
        a: 'f',
        b: 2,
        c: dt,
        d: ['f'],
        _id: '345weqrwqer234',
        __version: 2,
        __versions: [],
        __v: 2,
        __latest: true
      };
      const a_clean = {
        a: 'f',
        b: 2,
        c: dt,
        d: ['f']
      };
      const result = ModelVersioning.isThisDocsDifferent(a, a_clean);
      expect(result).to.be.false;
    });

    it('different in content of array', function() {
      const dt = new Date();
      const a = {
        a: 'f',
        b: 2,
        c: dt,
        d: ['f', 'asd'],
        _id: '345weqrwqer234',
        __version: 2,
        __versions: [],
        __v: 2,
        __latest: true
      };
      const a_clean = {
        a: 'f',
        b: 2,
        c: dt,
        d: ['f']
      };
      const result = ModelVersioning.isThisDocsDifferent(a, a_clean);
      expect(result).to.be.true;
    });

    it('different in content of sub object', function() {
      const dt = new Date();
      const a = {
        a: 'f',
        b: 2,
        c: dt,
        le: {
          h: 1
        },
        d: ['f'],
        _id: '345weqrwqer234',
        __version: 2,
        __versions: [],
        __v: 2,
        __latest: true
      };
      const a_clean = {
        a: 'f',
        b: 2,
        le: {
          h: 2
        },
        c: dt,
        d: ['f']
      };
      const result = ModelVersioning.isThisDocsDifferent(a, a_clean);
      expect(result).to.be.true;
    });
  });

  describe('isNew', function() {
    let firstHistoryVersion = {
        documentID: 1,
        username: 'username1',
        default: true,
        __latest: false,
        __versions: [],
        __version: 1,
        __closed: false
      },
      secondHistoryVersion = {
        ...firstHistoryVersion,
        username: 'username2',
        default: false,
        __version: 2,
        __closed: false
      };

    beforeEach(async () => {
      await modelProto.Document.deleteMany({});
    });

    it('same version', async () => {
      //setup
      let first = await (new(modelProto.Document)(firstHistoryVersion)).save();
      secondHistoryVersion.__versions = [first._id];
      let second = await (new modelProto.Document(secondHistoryVersion)).save();
      let latest = {
        ...secondHistoryVersion,
        __versions: [second._id, first._id],
        __latest: true
      };
      await (new modelProto.Document(latest)).save();
      //case
      const b = await ModelVersioning.isNew(modelProto.Document, latest);
      expect(b).to.be.false;
    });

    it('new version, without archived copy', async () => {
      //setup
      let first = await (new(modelProto.Document)(firstHistoryVersion)).save();
      secondHistoryVersion.__versions = [first._id];
      let second = await (new modelProto.Document(secondHistoryVersion)).save();
      let latest = {
        ...secondHistoryVersion,
        username: 'username3',
        __versions: [second._id, first._id],
        __latest: true
      };
      await (new modelProto.Document(latest)).save();
      //case
      const b = await ModelVersioning.isNew(modelProto.Document, latest);
      expect(b).to.be.true;
    });

    it('new version, with falty versions list', async () => {
      //setup
      let first = await (new(modelProto.Document)(firstHistoryVersion)).save();
      secondHistoryVersion.__versions = [first._id];
      let second = await (new modelProto.Document(secondHistoryVersion)).save();
      let latest = {
        ...secondHistoryVersion,
        username: 'username3',
        __versions: [mongoose.Types.ObjectId(), second._id, first._id],
        __latest: true
      };
      await (new modelProto.Document(latest)).save();
      //case
      try{
        await ModelVersioning.isNew(modelProto.Document, latest);
      }catch(e){
        expect(e.message).to.be.equal(ModelVersioning.ERR_NO_PREVIOUS_VERSIONS);
        return;
      }
      throw new Error('no exception from inside, ModelVersioning.ERR_NO_PREVIOUS_VERSIONS');
    });

    afterEach(async () => {
      await modelProto.Document.deleteMany({});
    });
  });

  describe('saveVersion', function() {
    beforeEach(async () => {
      await modelProto.Document.deleteMany({});
    });

    it('same version, should throw ERR_SAME_OLD_DATA', async () => {
      //setup
      let firstHistoryVersion = {
        documentID: 1,
        username: 'username',
        default: true,
        __versions: [],
        __version: 1,
      };
      let first = await (new(modelProto.Document)(firstHistoryVersion)).save();
      let secondHistoryVersion = {
        ...firstHistoryVersion,
        __versions: [first._id],
        __version: 2,
      };
      let second = await (new(modelProto.Document)(secondHistoryVersion)).save();
      try{
        await ModelVersioning.version.call(modelProto.Document, second._id)
      }catch(e){
        expect(e.message).to.be.equal(ModelVersioning.ERR_SAME_OLD_DATA);
        return;
      }
      throw new Error('no exception from inside, ModelVersioning.ERR_SAME_OLD_DATA');
    });

    it('update existing document', async () => {
      //setup
      let firstHistoryVersion = {
        documentID: 1,
        username: 'username',
        default: true,
        __versions: [],
        __version: 1,
        __latest: false,
        __closed: false
      };
      let first = await (new(modelProto.Document)(firstHistoryVersion)).save();
      let secondHistoryVersion = {
        ...firstHistoryVersion,
        __versions: [first._id],
        __version: 1,
        __latest: true,
        __closed: false
      };
      let second = await (new(modelProto.Document)(secondHistoryVersion)).save();
      second.username = 'username4';
      await second.save();
      let secondAfterVersioning = await ModelVersioning.version.call(modelProto.Document, second._id);
      expect(secondAfterVersioning.__version).to.be.equal(2);
      expect(secondAfterVersioning.__versions.length).to.be.equal(2);
      expect(secondAfterVersioning.__latest).to.be.true;
      expect(secondAfterVersioning.__closed).to.be.false;
      expect(secondAfterVersioning.username).to.be.equal('username4');
      let list = await modelProto.Document.find({}).exec();
      //console.log(list.map(doc => doc.toObject()));
      expect(list.length).to.be.equal(3);

      let latestCount = await modelProto.Document.countDocuments({__latest:true});
      expect(latestCount).to.be.equal(1);

      let notLatestCount = await modelProto.Document.countDocuments({__latest:false});
      expect(notLatestCount).to.be.equal(2);

      let notLatestNotClosedCount = await modelProto.Document.countDocuments({__latest:false, __closed: false});
      expect(notLatestNotClosedCount).to.be.equal(2);

      let currentCount = await modelProto.Document.countDocuments({__latest:true, __closed: false, __version: 2});
      expect(currentCount).to.be.equal(1);
    });

    afterEach(async () => {
      await modelProto.Document.deleteMany({});
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

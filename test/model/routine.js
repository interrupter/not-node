const expect = require('chai').expect,
  userProto = require('../testies/module/models/user.js'),
  userProtoNotIncremental = require('../testies/module/models/userNotIncremental.js'),
  plainProto = require('../testies/module/models/plainModel.js'),
  plainProtoIncremental = require('../testies/module/models/plainModelIncremental.js'),

  routine = require('../../src/model/routine'),
  ModelProto = require('../../src/model/proto');


module.exports = ({
  mongod,
  mongoose
}) => {
  before(async () => {
    ModelProto.fabricate(plainProto, null, mongoose);
    ModelProto.fabricate(plainProtoIncremental, null, mongoose);
    ModelProto.fabricate(userProto, null, mongoose);
    ModelProto.fabricate(userProtoNotIncremental, null, mongoose);

  });

  describe('Routine', function() {

    describe('addWithoutVersion', () => {
      it('ok', async () => {
        let PlainModel = plainProto.PlainModel;
        let item = await routine.addWithoutVersion(PlainModel, {
          name: 'User name 1',
          price: 10
        })
        expect(item).to.exist;
        expect(item.plainModelID).to.not.exist;
        expect(item.name).to.be.equal('User name 1');
      });

      it('with validation error', async () => {
        let PlainModel = plainProto.PlainModel;
        try {
          await routine.addWithoutVersion(PlainModel, {
            name: 'User name 1'
          });
        } catch (err) {
          expect(err).to.exist;
          expect(err.errors).to.have.key('price');
        }
      });
    });

    describe('addWithoutVersion', () => {
      it('ok', async () => {
        let User = userProto.UserLocal;
        let item = await routine.addWithVersion(User, {
          userLocalID: 1,
          name: 'User name 1',
          price: 10
        });
        expect(item).to.exist;
        expect(item.userLocalID).to.exist;
        expect(item.__latest).to.exist;
        expect(item.name).to.be.equal('User name 1');
      });

      it('with validation error', async () => {
        let User = userProto.UserLocal;
        try {
          await routine.addWithVersion(User, {
            name: 'User name 1',
            price: 10
          });
          expect(true).to.be.false;
        } catch (err) {
          expect(err).to.exist;
          expect(err.errors).to.have.key('userLocalID');
        }
      });
    });

    describe('add', () => {
      it('versioning OFF, incremental OFF', async () => {
        let PlainModel = plainProto.PlainModel;
        let item = await routine.add(PlainModel, {
          name: 'User name 1',
          price: 10
        });
        expect(item).to.exist;
        expect(item.plainModelID).to.not.exist;
        expect(item.name).to.be.equal('User name 1');
      });

      it('versioning OFF, incremental ON', async () => {
        let PlainModelIncremental = plainProtoIncremental.PlainModelIncremental;
        let item = await routine.add(PlainModelIncremental, {
          name: 'User name 1',
          price: 10
        });
        expect(item).to.exist;
        expect(item.plainModelIncrementalID).to.exist;
        expect(item.name).to.be.equal('User name 1');
      });

      it('versioning ON, incremental OFF', async () => {
        let UserLocalNotIncremental = userProtoNotIncremental.UserLocalNotIncremental;
        let item = await routine.add(UserLocalNotIncremental, {
          name: 'User name 1',
          price: 10
        });
        expect(item).to.exist;
        expect(item.userLocalNotIncrementalID).to.not.exist;
        expect(item.name).to.be.equal('User name 1');
      });

      it('versioning ON, ID=1', async () => {
        let User = userProto.UserLocal;
        expect(userProto.mongooseSchema.methods).to.have.keys(['close', 'getID']);
        let item = await routine.add(User, {
          name: 'User name 1',
          price: 10
        });
        expect(item).to.exist;
        expect(item.userLocalID).to.exist;
        expect(item.getID()).to.be.equal(1);
        expect(item.__latest).to.exist;
        expect(item.name).to.be.equal('User name 1');
      });

      it('versioning ON, ID=2', async () => {
        let User = userProto.UserLocal;
        let item = await routine.add(User, {
          name: 'User name 12',
          price: 11
        });
        expect(item).to.exist;
        expect(item.userLocalID).to.exist;
        expect(item.getID()).to.be.equal(2);
        expect(item.__latest).to.exist;
        expect(item.name).to.be.equal('User name 12');
      });
    });


    describe('update', ()=>{
      it('versioning OFF', async () => {
        const PlainModelIncremental = plainProtoIncremental.PlainModelIncremental;
        let item = await routine.add(PlainModelIncremental, {
          name: 'User name 32',
          price: 115
        });

        const res = await routine.update(PlainModelIncremental, {_id:item._id, price: 115}, {
          price: 555
        });

        expect(res._id.toString()).to.be.equal(item._id.toString());
        expect(res.price).to.be.equal(555);
      });
    });


    describe('updateMany', ()=>{
      it('versioning OFF', async () => {
        const PlainModelIncremental = plainProtoIncremental.PlainModelIncremental;
        let item1 = await routine.add(PlainModelIncremental, {
          name: 'User name 321',
          price: 111
        });
        let item2 = await routine.add(PlainModelIncremental, {
          name: 'User name 322',
          price: 104
        });
        let item3 = await routine.add(PlainModelIncremental, {
          name: 'User name 323',
          price: 102
        });
        const res = await routine.updateMany(
          PlainModelIncremental,
          {price:{$gte: 100, $lte: 120}},
          {price: 200}
        );
        //console.log(res.map(itm => itm.toObject()));
        const cnt = await PlainModelIncremental.countDocuments({price: 200});
        expect(cnt).to.be.equal(3);
      });
    });

  });

};

/** @module Model/Increment */

var thisSchema = {
  id: {
    type: String,
    unique: true,
    required: true
  },
  seq: {
    type: Number,
    default: 0,
    required: true
  }
};
var mongooseLocal = null;
var schema = null;

function newGetNext() {
  return async function(modelName) {
    let thisModel = this;
    let which = {
        id: modelName
      },
      cmd = {
        $inc: {
          seq: 1
        }
      },
      opts = {
        new: true
      };
    let doc;
    if (typeof thisModel.updateOne === 'function') {
      doc = await thisModel.updateOne(which, cmd, opts).exec();
    } else {
      doc = await thisModel.update(which, cmd, opts).exec();
    }
    doc = await thisModel.find(which).exec();
    if (doc.length > 0) {
      return doc[0].seq;
    } else {
      let t = {
        id: modelName,
        seq: 1
      };
      await thisModel.collection.insertOne(t);
      return 1;
    }
  };
}

function newRebase(){
  return async function(modelName, ID) {
    let thisModel = this;
    let which = {
        id: modelName
      },
      cmd = {
        seq: ID
      },
      opts = {
        new: true
      };
    let doc;
    if (typeof thisModel.updateOne === 'function') {
      doc = await thisModel.updateOne(which, cmd, opts).exec();
    } else {
      doc = await thisModel.update(which, cmd, opts).exec();
    }
    doc = await thisModel.find(which).exec();
    if (doc.length > 0) {
      return doc[0].seq;
    } else {
      let t = {
        id: modelName,
        seq: 1
      };
      await thisModel.collection.insertOne(t);
      return 1;
    }
  };
}

exports.init = function(mongoose) {
  mongooseLocal = mongoose;
  schema = new(mongooseLocal.Schema)(thisSchema);
  schema.statics.getNext = newGetNext();
  schema.statics.rebase = newRebase();
  var model = null;
  try {
    model = mongooseLocal.model('Increment', schema);
  } catch (e) {
    model = mongooseLocal.model('Increment');
  }
  exports.model = model;
  exports.next = model.getNext.bind(model);
  exports.rebase = model.rebase.bind(model);
};

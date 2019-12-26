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

exports.init = function(mongoose) {
    mongooseLocal = mongoose;
    schema = new(mongooseLocal.Schema)(thisSchema);
    schema.statics.getNext = async (modelName) => {
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

      let doc = await thisModel.updateOne(which, cmd, opts);
      if (doc) {
        return doc.seq;
      } else {
        let t = {
          id: modelName,
          seq: 1
        };
        await thisModel.collection.insert(t).exec();
        return 1;
      }

    }

    var model = null;
    try {
      model = mongooseLocal.model('Increment', schema);
    } catch (e) {
      model = mongooseLocal.model('Increment');
    }
    exports.model = model;
    exports.next = model.getNext.bind(model);
	}

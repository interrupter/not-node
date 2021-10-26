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

function notContainedInData(fields, data){
  let keys = Object.keys(data);
  return fields.filter((field)=>{
    return !keys.includes(field);
  });
}


function formId(modelName, filterFields, data){
  let idParts = [
    modelName,
    ...filterFields.map( field => data[field].toString() )
  ];
  return idParts.join('_');
}

function newGetNext() {
  return async function(modelName, filterFields, data) {
    let thisModel = this;
    let id = modelName;
    if(filterFields && Array.isArray(filterFields) && filterFields.length){
      let miss = notContainedInData(filterFields, data);
      if(miss.length === 0){
        id = formId(modelName, filterFields, data);
      }else{
        throw new Error('Fields not exist in data object: ' + miss.join(', '));
      }
    }
    let which = {
        id
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
        id,
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

module.exports.init = function(mongoose) {
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
  module.exports.model = model;
  module.exports.next = model.getNext.bind(model);
  module.exports.rebase = model.rebase.bind(model);
};

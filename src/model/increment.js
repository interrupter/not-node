/** @module Model/Increment */



const thisSchema = {
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

let mongooseLocal = null;
let schema = null;

/**
* Returns sub-list of fields which is not contained in object
* @param {Array.string} fields  list of fields
* @param {Object}       data    object to filter against
* @return {Array.string}        sub-list of fields not contained in object
**/
function notContainedInData(fields, data){
  let keys = Object.keys(data);
  return fields.filter((field)=>{
    return !keys.includes(field);
  });
}

module.exports.notContainedInData = notContainedInData;

/**
*
**/
function formId(modelName, filterFields, data){
  let idParts = [
    modelName,
    ...filterFields.map( field => data[field].toString() )
  ];
  return idParts.join('_');
}

module.exports.formId = formId;
/**
* Some drivers versions work-arounds
* @param  {Mongoose.Model} thisModel   counter model
* @param  {Object}         which     filter object of update request
* @param  {Object}         cmd          command object of update request
* @param  {Object}         opts       options of request
**/
function secureUpdate(thisModel, which, cmd, opts){
  if (typeof thisModel.updateOne === 'function') {
    return thisModel.updateOne(which, cmd, opts).exec();
  } else {
    return thisModel.update(which, cmd, opts).exec();
  }
}

module.exports.secureUpdate = secureUpdate;

function updateResponseSuccess(res){
  if(res){
    const responseList = Object.keys(res);
    if(responseList.includes('ok')){
      return (res.ok === 1 && res.n === 1);
    }else{
      return (res.matchedCount === 1 && res.modifiedCount === 1);
    }
  }else{
    return false;
  }
}

/**
* Generate new ID for current model and filterFields
**/
function newGetNext() {
  /**
  * Generates next ID for modelName with additional possibility to index only in
  * sub-set of all documents, which is grouped by fields (filterFields) with
  * same value
  * @param  {string}  modelName
  * @param  {Array.string}  filterFields    list of fild names, which is used for grouping
  * @param  {Object}  data                  item data
  * @return {Promise.Number}
  **/
  return async function(modelName, filterFields, data) {
    let thisModel = this;
    let id = modelName;
    if(Array.isArray(filterFields)){
      //if we miss fields in data for grouping
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
        new: true,
        upsert: true
      };
    const res = await secureUpdate(thisModel, which, cmd, opts);
    if(updateResponseSuccess(res)){
      const doc = await thisModel.findOne({id});
      return doc.seq;
    }else{
      throw new Error('ID generation failed');
    }
  };
}

module.exports.newGetNext = newGetNext;



/**
* Sets new current ID for model
* @param {string} modelName   name of target model
* @param {number} ID          desired new start ID for model
**/
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
        new: true,
        upsert: true
      };
    //updating
    let res = await secureUpdate(thisModel, which, cmd, opts);
    if(updateResponseSuccess(res)){
      return ID;
    }else{
      throw new Error('ID generator rebase failed');
    }
  };
}

module.exports.newRebase = newRebase;

module.exports.init = function(mongoose) {
  mongooseLocal = mongoose;
  schema = new(mongooseLocal.Schema)(thisSchema);
  schema.statics.getNext = newGetNext();
  schema.statics.rebase = newRebase();
  let model = null;
  try {
    model = mongooseLocal.model('Increment', schema);
  }catch{
    model = mongooseLocal.model('Increment');
  }
  module.exports.model = model;
  module.exports.next = model.getNext.bind(model);
  module.exports.rebase = model.rebase.bind(model);
};

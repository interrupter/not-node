/** @module Model/Routine */

const incrementNext = require('./increment');

function returnErrors(err, callbackError) {
  var i, validationReport = {};
  for (i in err.errors) {
    validationReport[i] = err.errors[i].message;
  }
  callbackError && callbackError(err, validationReport);
}

function addWithoutVersion(thisModel, data) {
  return (new thisModel(data)).save();
}

function addWithVersion(thisModel, data) {
  data.__latest = true;
  return (new thisModel(data)).save()
    .then((item) => {
      return thisModel.saveVersion(item._id);
    });
}

function add(model, data) {
  let thisModel = model,
    that = this;
  return new Promise((resolve, reject) => {
    if (model.__incField) {
      incrementNext.next(model.__incModel, model.__incFilter, data)
        .then((modelId) => {
          data[model.__incField] = modelId;
          if (model.__versioning) {
            that.addWithVersion(thisModel, data)
              .then(resolve)
              .catch(reject);
          } else {
            that.addWithoutVersion(thisModel, data)
              .then(resolve)
              .catch(reject);
          }
        })
        .catch(reject);
    } else {
      if (model.__versioning) {
        this.addWithVersion(thisModel, data)
          .then(resolve)
          .catch(reject);
      } else {
        this.addWithoutVersion(thisModel, data)
          .then(resolve)
          .catch(reject);
      }
    }
  });
}

async function update(model, filter, data){
  let thisModel = model;
  if (model.__versioning) {
    return this.updateWithVersion(thisModel, filter, data);
  } else {
    return this.updateWithoutVersion(thisModel, filter, data);
  }
}

function updateWithoutVersion(thisModel, filter, data) {
  return thisModel.findOneAndUpdate(
    filter,
    data,
    {returnOriginal: false}
  ).exec();
}

function updateWithVersion(thisModel, filter, data) {
  filter.__latest = true;
  filter.__closed = false;
  return thisModel.findOneAndUpdate(filter, data, {returnOriginal: false}).exec()
    .then(item => thisModel.saveVersion(item._id));
}

async function updateMany(model, filter, data){
  let thisModel = model;
  if (model.__versioning) {
    return this.updateManyWithVersion(thisModel, filter, data);
  } else {
    return this.updateWithoutVersion(thisModel, filter, data);
  }
}

function updateManyWithoutVersion(thisModel, filter, data) {
  return thisModel.updateMany(
    filter,
    data
  ).exec();
}

async function updateManyWithVersion(thisModel, filter, data) {
  filter.__latest = true;
  filter.__closed = false;
  let list = await thisModel.find(filter).exec();
  return await Promise.all(list.map((item) => {
    return updateWithVersion(thisModel, {_id: item._id }, data);
  }));
}

module.exports = {
  add,
  update,
  returnErrors,
  addWithoutVersion,
  addWithVersion,
  updateWithoutVersion,
  updateWithVersion,
  updateMany,
  updateManyWithoutVersion,
  updateManyWithVersion,
};

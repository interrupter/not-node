/** @module Model/Routine */

const incrementNext = require('./increment');

class ModelRoutine{

  static addWithoutVersion(thisModel, data) {
    return (new thisModel(data)).save();
  }

  static addWithVersion(thisModel, data) {
    data.__latest = true;
    return (new thisModel(data)).save()
      .then((item) => {
        return thisModel.saveVersion(item._id);
      });
  }

  static add(model, data) {
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

  static async update(model, filter, data){
    let thisModel = model;
    if (model.__versioning) {
      return this.updateWithVersion(thisModel, filter, data);
    } else {
      return this.updateWithoutVersion(thisModel, filter, data);
    }
  }

  static updateWithoutVersion(thisModel, filter, data) {
    return thisModel.findOneAndUpdate(
      filter,
      data,
      {returnOriginal: false}
    ).exec();
  }

  static updateWithVersion(thisModel, filter, data) {
    filter.__latest = true;
    filter.__closed = false;
    return thisModel.findOneAndUpdate(filter, data, {returnOriginal: false}).exec()
      .then(item => thisModel.saveVersion(item._id));
  }

  static async updateMany(model, filter, data){
    let thisModel = model;
    if (model.__versioning) {
      return this.updateManyWithVersion(thisModel, filter, data);
    } else {
      return this.updateWithoutVersion(thisModel, filter, data);
    }
  }

  updateManyWithoutVersion(thisModel, filter, data) {
    return thisModel.updateMany(
      filter,
      data
    ).exec();
  }

  static async updateManyWithVersion(thisModel, filter, data) {
    let list = await thisModel.find({
      __closed: false,
      __latest: true,
      ...filter
    }).exec();
    return await Promise.all(list.map((item) => {
      return ModelRoutine.updateWithVersion(thisModel, {_id: item._id }, data);
    }));
  }

}


module.exports = ModelRoutine;

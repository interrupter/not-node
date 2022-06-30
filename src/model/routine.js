/** @module Model/Routine */

const incrementNext = require("./increment");

class ModelRoutine {
    static incremental(model) {
        return model.schema.statics.__incField;
    }

    static versioning(model) {
        return model.schema.statics.__versioning;
    }

    static addWithoutVersion(model, data) {
        return new model(data).save();
    }

    static async addWithVersion(model, data) {
        data.__latest = true;
        const item = await new model(data).save();
        return await model.saveVersion(item._id);
    }

    static async add(model, data) {
        if (ModelRoutine.incremental(model)) {
            const modelID = await incrementNext.next(
                model.__incModel,
                model.__incFilter,
                data
            );
            data[model.__incField] = modelID;
            if (ModelRoutine.versioning(model)) {
                return await ModelRoutine.addWithVersion(model, data);
            } else {
                return await ModelRoutine.addWithoutVersion(model, data);
            }
        } else {
            if (ModelRoutine.versioning(model)) {
                return await ModelRoutine.addWithVersion(model, data);
            } else {
                return await ModelRoutine.addWithoutVersion(model, data);
            }
        }
    }

    static async update(model, filter, data) {
        if (ModelRoutine.versioning(model)) {
            return ModelRoutine.updateWithVersion(model, filter, data);
        } else {
            return ModelRoutine.updateWithoutVersion(model, filter, data);
        }
    }

    static updateWithoutVersion(model, filter, data) {
        return model
            .findOneAndUpdate(filter, data, {
                returnOriginal: false,
                new: true,
            })
            .exec();
    }

    static async updateWithVersion(model, filter, data) {
        filter.__latest = true;
        filter.__closed = false;
        const item = await model
            .findOneAndUpdate(filter, data, { returnOriginal: false })
            .exec();
        return model.saveVersion(item._id);
    }

    static async updateMany(model, filter, data) {
        if (ModelRoutine.versioning(model)) {
            return ModelRoutine.updateManyWithVersion(model, filter, data);
        } else {
            return ModelRoutine.updateManyWithoutVersion(model, filter, data);
        }
    }

    static updateManyWithoutVersion(model, filter, data) {
        return model.updateMany(filter, data);
    }

    static async updateManyWithVersion(model, filter, data) {
        const list = await model
            .find({
                __closed: false,
                __latest: true,
                ...filter,
            })
            .exec();
        return await Promise.allSettled(
            list.map((item) => {
                return ModelRoutine.updateWithVersion(
                    model,
                    { _id: item._id },
                    data
                );
            })
        );
    }
}

module.exports = ModelRoutine;

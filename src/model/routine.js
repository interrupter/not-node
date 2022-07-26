/** @module Model/Routine */

const incrementNext = require("./increment");
const { DBExceptionUpdateOneWasNotSuccessful } = require("../exceptions/db");

//const { updateResponseSuccess } = require("./utils");
class ModelRoutine {
    static incremental(ModelConstructor) {
        return ModelConstructor.schema.statics.__incField;
    }

    static versioning(ModelConstructor) {
        return ModelConstructor.schema.statics.__versioning;
    }

    static addWithoutVersion(ModelConstructor, data) {
        return new ModelConstructor(data).save();
    }

    static async addWithVersion(ModelConstructor, data) {
        data.__latest = true;
        const item = await new ModelConstructor(data).save();
        return await ModelConstructor.saveVersion(item._id);
    }

    static async add(ModelConstructor, data) {
        if (ModelRoutine.incremental(ModelConstructor)) {
            const modelID = await incrementNext.next(
                ModelConstructor.__incModel,
                ModelConstructor.__incFilter,
                data
            );
            data[ModelConstructor.__incField] = modelID;
            if (ModelRoutine.versioning(ModelConstructor)) {
                return await ModelRoutine.addWithVersion(
                    ModelConstructor,
                    data
                );
            } else {
                return await ModelRoutine.addWithoutVersion(
                    ModelConstructor,
                    data
                );
            }
        } else {
            if (ModelRoutine.versioning(ModelConstructor)) {
                return await ModelRoutine.addWithVersion(
                    ModelConstructor,
                    data
                );
            } else {
                return await ModelRoutine.addWithoutVersion(
                    ModelConstructor,
                    data
                );
            }
        }
    }

    static async update(ModelConstructor, filter, data) {
        if (data && "_id" in data) delete data._id;
        if (ModelRoutine.versioning(ModelConstructor)) {
            return ModelRoutine.updateWithVersion(
                ModelConstructor,
                filter,
                data
            );
        } else {
            return ModelRoutine.updateWithoutVersion(
                ModelConstructor,
                filter,
                data
            );
        }
    }

    static updateWithoutVersion(ModelConstructor, filter, data) {
        return ModelConstructor.findOneAndUpdate(
            filter,
            { $set: data },
            {
                returnOriginal: false,
                returnDocument: "after",
                new: true,
            }
        )
            .exec()
            .then((result) => {
                if (result) {
                    return result;
                } else {
                    throw new Error("updateWithoutVersion FAILED");
                }
            });
    }

    static async updateWithVersion(ModelConstructor, filter, data) {
        let result;
        const session = await ModelConstructor.startSession();
        await session.withTransaction(async () => {
            filter.__latest = true;
            filter.__closed = false;
            if (ModelConstructor.findOneAndUpdate) {
                const updateResult = await ModelConstructor.findOneAndUpdate(
                    filter,
                    { $set: data },
                    {
                        returnOriginal: false,
                        returnDocument: "after",
                        new: true,
                    }
                );
                if (updateResult) {
                    result = await ModelConstructor.saveVersion(
                        ModelConstructor,
                        updateResult._id
                    );
                } else {
                    throw new DBExceptionUpdateOneWasNotSuccessful();
                }
            } else {
                throw new DBExceptionUpdateOneWasNotSuccessful();
            }
        });
        session.endSession();
        return result;
    }

    static async updateMany(ModelConstructor, filter, data) {
        if ("_id" in data) delete data._id;
        if (ModelRoutine.versioning(ModelConstructor)) {
            return ModelRoutine.updateManyWithVersion(
                ModelConstructor,
                filter,
                data
            );
        } else {
            return ModelRoutine.updateManyWithoutVersion(
                ModelConstructor,
                filter,
                data
            );
        }
    }

    static updateManyWithoutVersion(ModelConstructor, filter, data) {
        return ModelConstructor.updateMany(filter, data);
    }

    static async updateManyWithVersion(ModelConstructor, filter, data) {
        const list = await ModelConstructor.find({
            __closed: false,
            __latest: true,
            ...filter,
        });
        return await Promise.allSettled(
            list.map((item) => {
                return ModelRoutine.updateWithVersion(
                    ModelConstructor,
                    { _id: item._id },
                    data
                );
            })
        );
    }
}

module.exports = ModelRoutine;

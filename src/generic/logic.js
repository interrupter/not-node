const { objHas, isFunc, executeFunctionAsAsync } = require("../common");
const ModelRoutine = require("../model/routine");
const { deleteResponseSuccess } = require("../model/utils.js");
const {
    DBExceptionDocumentIsNotFound,
    DBExceptionDeleteWasNotSuccessful,
    DBExceptionDocumentIsNotOwnerByActiveUser,
} = require("../exceptions/db.js");

const isOwnerImported = require("../auth/fields.js").isOwner;
const { DOCUMENT_OWNER_FIELD_NAME } = require("../auth/const.js");
const notFilter = require("not-filter");

module.exports = ({
    MODEL_NAME,
    MODULE_NAME,
    Log,
    LogAction,
    say,
    phrase,
    config,
    getModel,
    getModelSchema,
    getLogic,
    getModelUser,
    isOwner = isOwnerImported, // (doc, activeUser) => bool
    ownerFieldName = DOCUMENT_OWNER_FIELD_NAME,
    populateBuilders = {},
    defaultPopulate = [],
}) => {
    const logDebugAction = (action, identity) => {
        Log.debug(
            `${MODULE_NAME}//Logic//${MODEL_NAME}//${action}`,
            identity?.ip,
            identity?.root
        );
    };
    const checkShouldOwn = (data, shouldOwn, identity) => {
        if (shouldOwn) {
            data[ownerFieldName] = identity?.uid;
        }
    };

    /**
     * what to populate in action
     */
    const getPopulate = async (actionName, prepared) => {
        if (
            populateBuilders &&
            objHas(populateBuilders, actionName) &&
            isFunc(populateBuilders[actionName])
        ) {
            return await executeFunctionAsAsync(populateBuilders[actionName], [
                prepared,
            ]);
        }
        return defaultPopulate;
    };

    return class {
        static Log = Log;
        static LogAction = LogAction;
        static say = say;
        static phrase = phrase;
        static config = config;
        static getModel = getModel;
        static getModelSchema = getModelSchema;
        static getLogic = getLogic;
        static getModelUser = getModelUser;
        static isOwner = isOwner;
        static ownerFieldName = ownerFieldName;

        /**
         *
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}
         */
        static async _create({ action, data, identity, shouldOwn = false }) {
            logDebugAction(action, identity);
            checkShouldOwn(data, shouldOwn, identity);
            const res = await getModel().add(data);
            LogAction(action, identity, {
                targetId: res?._id,
            });
            return res;
        }

        /**
         * create item
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               new document
         **/
        static async create({ data, identity }) {
            return await this._create({
                data,
                identity,
                action: "create",
                shouldOwn: false,
            });
        }

        /**
         * create item and own it
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               new document
         **/
        static async createOwn({ data, identity }) {
            return await this._create({
                data,
                identity,
                action: "createOwn",
                shouldOwn: true,
            });
        }

        /**
         *
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}
         */
        static async _updateOne({
            targetId,
            data,
            identity,
            action,
            shouldOwn = true,
        }) {
            logDebugAction(action, identity);
            let query = {
                _id: targetId,
            };
            checkShouldOwn(query, shouldOwn, identity);
            const result = await getModel().update(query, data);
            LogAction(action, identity, {
                targetId,
                version: result?.__version,
            });
            return result;
        }

        /**
         * update item
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               updated document
         **/
        static async update({ targetId, data, identity }) {
            return await this._updateOne({
                targetId,
                data,
                identity,
                action: "update",
                shouldOwn: false,
            });
        }

        /**
         * update own item
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               updated document
         **/
        static async updateOwn({ targetId, data, identity }) {
            return await this._updateOne({
                targetId,
                data,
                identity,
                action: "updateOwn",
                shouldOwn: true,
            });
        }

        /**
         * get item with populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async _getOne({ targetId, action, identity, shouldOwn = true }) {
            logDebugAction(action, identity);
            let query = {};
            checkShouldOwn(query, shouldOwn, identity);
            let populate = await getPopulate(action, {
                targetId,
                identity,
            });
            const result = await getModel().getOne(targetId, populate, query);
            LogAction(action, identity, {
                targetId,
                version: result?.__version,
            });
            return result;
        }

        /**
         * get item with populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async get({ targetId, identity }) {
            return await this._getOne({
                targetId,
                action: "get",
                identity,
                shouldOwn: false,
            });
        }

        /**
         * get activeUser own item with populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async getOwn({ targetId, identity }) {
            return await this._getOne({
                targetId,
                action: "getOwn",
                identity,
                shouldOwn: true,
            });
        }

        /**
         * get item with populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async _getOneByID({
            targetID,
            action,
            identity,
            shouldOwn = true,
        }) {
            logDebugAction(action, identity);
            let query = {};
            checkShouldOwn(query, shouldOwn, identity);
            let populate = await getPopulate(action, {
                targetID,
                identity,
            });
            const result = await getModel().getOneByID(
                targetID,
                query,
                populate
            );
            LogAction(action, identity, {
                targetID,
                version: result?.__version,
            });
            return result;
        }

        /**
         * get item with populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async getByID({ targetID, identity }) {
            return await this._getOneByID({
                targetID,
                action: "getByID",
                identity,
                shouldOwn: false,
            });
        }

        /**
         * get activeUser own item with populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async getByIDOwn({ targetID, identity }) {
            return await this._getOneByID({
                targetID,
                action: "getByIDOwn",
                identity,
                shouldOwn: true,
            });
        }

        /**
         * get item without populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async _getOneRaw({
            targetId,
            identity,
            action,
            shouldOwn = true,
        }) {
            logDebugAction(action, identity);
            let query = {};
            checkShouldOwn(query, shouldOwn, identity);
            const result = await getModel().getOneRaw(targetId, query);
            LogAction(action, identity, {
                targetId,
                version: result?.__version,
            });
            return result;
        }

        /**
         * get item without populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async getRaw({ targetId, identity }) {
            return await this._getOneRaw({
                targetId,
                identity,
                shouldOwn: false,
                action: "getRaw",
            });
        }

        /**
         * get item without populated sub-documents, if it's owned by activeUser
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async getOwnRaw({ targetId, identity }) {
            return await this._getOneRaw({
                targetId,
                identity,
                shouldOwn: true,
                action: "getOwnRaw",
            });
        }

        /**
         * removes item by id, if activeUser is its owner
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async _delete({
            action,
            targetId,
            identity,
            shouldOwn = false,
        }) {
            logDebugAction(action, identity);
            const model = getModel();
            const versioning = ModelRoutine.versioning(model);
            if (versioning) {
                let itm = await model.getOneRaw(targetId);
                if (!itm) {
                    throw new DBExceptionDocumentIsNotFound();
                }
                if (shouldOwn && !isOwner(itm, identity?.uid)) {
                    throw new DBExceptionDocumentIsNotOwnerByActiveUser({
                        params: {
                            targetId,
                            activeUserId: identity?.uid,
                            role: identity?.role,
                            versioning,
                        },
                    });
                } else {
                    await itm.close();
                }
            } else {
                let query = { _id: targetId };
                checkShouldOwn(query, shouldOwn, identity);
                const result = await model.findOneAndDelete(query).exec();
                if (!deleteResponseSuccess(result)) {
                    throw new DBExceptionDeleteWasNotSuccessful({
                        params: {
                            result,
                            targetId,
                            activeUserId: identity?.uid,
                            role: identity?.role,
                            versioning,
                        },
                    });
                }
            }
            LogAction(action, identity, {
                targetId,
            });
        }

        /**
         * removes item by id
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async delete({ targetId, identity }) {
            await this._delete({
                action: "delete",
                targetId,
                identity,
                shouldOwn: false,
            });
        }

        /**
         * removes item by id, if activeUser is its owner
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async deleteOwn({ targetId, identity }) {
            await this._delete({
                action: "deleteOwn",
                targetId,
                identity,
                shouldOwn: true,
            });
        }

        /**
         *
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Array<Object>>}
         */
        static async _listAll({ identity, action, shouldOwn = false }) {
            logDebugAction(action, identity);
            let filter = {};
            checkShouldOwn(filter, shouldOwn, identity);
            const result = await getModel().listAll(filter);
            LogAction(action, identity, { shouldOwn });
            return result.map((itm) => itm.toObject());
        }

        static async listAll({ identity }) {
            return await this._listAll({
                identity,
                action: "listAll",
                shouldOwn: false,
            });
        }

        static async listAllOwn({ identity }) {
            return await this._listAll({
                identity,
                action: "listAllOwn",
                shouldOwn: true,
            });
        }

        static async _listAndCount({
            query,
            action,
            identity,
            shouldOwn = false,
        }) {
            logDebugAction(action, identity);
            const { skip, size, sorter, filter, search } = query;
            let populate = await getPopulate(action, {
                identity,
            });
            if (shouldOwn) {
                notFilter.filter.modifyRules(filter, {
                    [ownerFieldName]: identity?.uid,
                });
            }
            const result = await getModel().listAndCount(
                skip,
                size,
                sorter,
                filter,
                search,
                populate
            );
            result.list = result.list.map((itm) => itm.toObject());
            LogAction(action, identity, { shouldOwn });
            return result;
        }

        static async listAndCount({ query, identity }) {
            return await this._listAndCount({
                query,
                identity,
                action: "listAndCount",
                shouldOwn: false,
            });
        }

        static async listAndCountOwn({ query, identity }) {
            return await this._listAndCount({
                query,
                identity,
                action: "listAndCountOwn",
                shouldOwn: true,
            });
        }

        static async _list({ query, identity, action, shouldOwn = false }) {
            logDebugAction(action, identity);
            const { skip, size, sorter, filter } = query;
            let populate = await getPopulate(action, {
                identity,
            });
            if (shouldOwn) {
                notFilter.filter.modifyRules(filter, {
                    [ownerFieldName]: identity?.uid,
                });
            }
            const result = await getModel().listAndPopulate(
                skip,
                size,
                sorter,
                filter,
                populate
            );
            LogAction(action, identity, { shouldOwn });
            return result.map((itm) => itm.toObject());
        }

        static async list({ query, identity }) {
            return await this._list({
                query,
                identity,
                action: "list",
                shouldOwn: false,
            });
        }

        static async listOwn({ query, identity }) {
            return await this._list({
                query,
                identity,
                action: "listOwn",
                shouldOwn: true,
            });
        }

        static async _count({ query, action, identity, shouldOwn = false }) {
            logDebugAction(action, identity);
            const { filter, search } = query;
            if (shouldOwn) {
                notFilter.filter.modifyRules(filter, {
                    [ownerFieldName]: identity?.uid,
                });
            }
            if (search) {
                notFilter.filter.modifyRules(search, filter);
            }
            const result = await getModel().countWithFilter(search || filter);
            LogAction(action, identity, { shouldOwn });
            return result;
        }

        static async count({ query, identity }) {
            return await this._count({
                query,
                identity,
                action: "count",
                shouldOwn: false,
            });
        }

        static async countOwn({ query, identity }) {
            return await this._count({
                query,
                identity,
                action: "countOwn",
                shouldOwn: true,
            });
        }
    };
};

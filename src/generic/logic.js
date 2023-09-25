const { objHas, isFunc, executeFunctionAsAsync } = require("../common");
const ModelRoutine = require("../model/routine");
const { deleteResponseSuccess } = require("../model/utils.js");
const {
    DBExceptionDocumentIsNotFound,
    DBExceptionDeleteWasNotSuccessful,
} = require("../exceptions/db.js");
const {
    DBExceptionDocumentIsNotOwnerByActiveUser,
} = require("../exceptions/http");
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
        static async _create({
            action,
            data,
            activeUser,
            ip,
            root = false,
            shouldOwn = false,
        }) {
            Log.debug(
                `${MODULE_NAME}//Logic//${MODEL_NAME}//${action}`,
                ip,
                root
            );
            if (shouldOwn) {
                data[ownerFieldName] = activeUser?._id;
            }
            const res = await getModel().add(data);
            LogAction(
                {
                    action,
                    by: activeUser?._id,
                    role: activeUser?.role,
                    ip,
                    root,
                },
                {
                    targetId: res._id,
                }
            );
            return res;
        }

        /**
         * create item
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               new document
         **/
        static async create({ data, activeUser, ip, root = false }) {
            return await this._create({
                data,
                activeUser,
                ip,
                root,
                action: "create",
                shouldOwn: false,
            });
        }

        /**
         * create item and own it
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               new document
         **/
        static async createOwn({ data, activeUser, ip, root = false }) {
            return await this._create({
                data,
                activeUser,
                ip,
                root,
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
            activeUser,
            action,
            root,
            ip,
            shouldOwn = true,
        }) {
            Log.debug(
                `${MODULE_NAME}//Logic//${MODEL_NAME}//${action}`,
                targetId,
                ip,
                root
            );
            let query = {
                _id: targetId,
            };
            if (shouldOwn) {
                query[ownerFieldName] = activeUser?._id;
            }
            const result = await getModel().update(query, data);
            LogAction(
                {
                    action,
                    by: activeUser?._id,
                    role: activeUser?.role,
                    ip,
                },
                {
                    targetId,
                    version: result.__version,
                }
            );
            return result;
        }

        /**
         * update item
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               updated document
         **/
        static async update({ targetId, data, activeUser, ip, root = false }) {
            return await this._updateOne({
                targetId,
                data,
                activeUser,
                ip,
                root,
                action: "update",
                shouldOwn: false,
            });
        }

        /**
         * update own item
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               updated document
         **/
        static async updateOwn({
            targetId,
            data,
            activeUser,
            ip,
            root = false,
        }) {
            return await this._updateOne({
                targetId,
                data,
                activeUser,
                ip,
                root,
                action: "updateOwn",
                shouldOwn: true,
            });
        }

        /**
         * get item with populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async _getOne({
            targetId,
            action,
            ip,
            root,
            activeUser,
            shouldOwn = true,
        }) {
            Log.debug(
                `${MODULE_NAME}//Logic//${MODEL_NAME}//${action}`,
                targetId,
                ip,
                root
            );
            let query = {};
            if (shouldOwn) {
                query[ownerFieldName] = activeUser?._id;
            }
            let populate = await getPopulate(action, {
                targetId,
                activeUser,
                ip,
                root,
            });
            const result = await getModel().getOne(targetId, populate, query);
            LogAction(
                {
                    action,
                    by: activeUser?._id,
                    role: activeUser?.role,
                    ip,
                },
                {
                    targetId,
                    version: result.__version,
                }
            );
            return result;
        }

        /**
         * get item with populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async get({ targetId, activeUser, ip, root = false }) {
            return await this._getOne({
                targetId,
                action: "get",
                activeUser,
                ip,
                root,
                shouldOwn: false,
            });
        }

        /**
         * get activeUser own item with populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async getOwn({ targetId, activeUser, ip, root = false }) {
            return await this._getOne({
                targetId,
                action: "getOwn",
                activeUser,
                ip,
                root,
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
            ip,
            root,
            activeUser,
            shouldOwn = true,
        }) {
            Log.debug(
                `${MODULE_NAME}//Logic//${MODEL_NAME}//${action}`,
                targetID,
                ip,
                root
            );
            let query = {};
            if (shouldOwn) {
                query[ownerFieldName] = activeUser?._id;
            }
            let populate = await getPopulate(action, {
                targetID,
                activeUser,
                ip,
                root,
            });
            const result = await getModel().getOneByID(
                targetID,
                query,
                populate
            );
            LogAction(
                {
                    action,
                    by: activeUser?._id,
                    role: activeUser?.role,
                    ip,
                },
                {
                    targetID,
                    version: result.__version,
                }
            );
            return result;
        }

        /**
         * get item with populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async getByID({ targetID, activeUser, ip, root = false }) {
            return await this._getOneByID({
                targetID,
                action: "getByID",
                activeUser,
                ip,
                root,
                shouldOwn: false,
            });
        }

        /**
         * get activeUser own item with populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async getByIDOwn({ targetID, activeUser, ip, root = false }) {
            return await this._getOneByID({
                targetID,
                action: "getByIDOwn",
                activeUser,
                ip,
                root,
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
            activeUser,
            ip,
            root,
            action,
            shouldOwn = true,
        }) {
            Log.debug(
                `${MODULE_NAME}//Logic//${MODEL_NAME}//${action}`,
                targetId,
                ip,
                root
            );
            let query = {};
            if (shouldOwn) {
                query[ownerFieldName] = activeUser?._id;
            }
            const result = await getModel().getOneRaw(targetId, query);
            LogAction(
                {
                    action,
                    by: activeUser?._id,
                    role: activeUser?.role,
                    ip,
                    root,
                },
                {
                    targetId,
                    version: result.__version,
                }
            );
            return result;
        }

        /**
         * get item without populated sub-documents
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async getRaw({ targetId, activeUser, ip, root = false }) {
            return await this._getOneRaw({
                targetId,
                activeUser,
                shouldOwn: false,
                action: "getRaw",
                ip,
                root,
            });
        }

        /**
         * get item without populated sub-documents, if it's owned by activeUser
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async getOwnRaw({ targetId, activeUser, ip, root = false }) {
            return await this._getOneRaw({
                targetId,
                activeUser,
                shouldOwn: true,
                action: "getOwnRaw",
                ip,
                root,
            });
        }

        /**
         * removes item by id, if activeUser is its owner
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async _delete({
            action,
            ip,
            root,
            targetId,
            activeUser,
            shouldOwn = false,
        }) {
            Log.debug(
                `${MODULE_NAME}//Logic//${MODEL_NAME}//${action}`,
                targetId,
                ip,
                root
            );
            const model = getModel();
            const versioning = ModelRoutine.versioning(model);
            if (versioning) {
                let itm = await model.getOneRaw(targetId);
                if (!itm) {
                    throw new DBExceptionDocumentIsNotFound();
                }
                if (shouldOwn && !isOwner(itm, activeUser?._id)) {
                    throw new DBExceptionDocumentIsNotOwnerByActiveUser({
                        params: {
                            targetId,
                            activeUserId: activeUser?._id,
                            role: activeUser?.role,
                            versioning,
                        },
                    });
                } else {
                    await itm.close();
                }
            } else {
                let query = { _id: targetId };
                if (shouldOwn) {
                    query[ownerFieldName] = activeUser?._id;
                }
                const result = await model.findOneAndDelete(query).exec();
                if (!deleteResponseSuccess(result)) {
                    throw new DBExceptionDeleteWasNotSuccessful({
                        params: {
                            result,
                            targetId,
                            activeUserId: activeUser?._id,
                            role: activeUser?.role,
                            versioning,
                        },
                    });
                }
            }
            LogAction(
                {
                    action,
                    by: activeUser?._id,
                    role: activeUser?.role,
                    ip,
                    root,
                },
                {
                    targetId,
                }
            );
        }

        /**
         * removes item by id
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async delete({ targetId, activeUser, ip, root = false }) {
            await this._delete({
                action: "delete",
                targetId,
                root,
                ip,
                activeUser,
                shouldOwn: false,
            });
        }

        /**
         * removes item by id, if activeUser is its owner
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Object>}               requested document
         **/
        static async deleteOwn({ targetId, activeUser, ip, root = false }) {
            await this._delete({
                action: "deleteOwn",
                targetId,
                ip,
                root,
                activeUser,
                shouldOwn: true,
            });
        }

        /**
         *
         * @param {import('../types').PreparedData}  prepared
         * @returns {Promise<Array<Object>>}
         */
        static async _listAll({
            activeUser,
            ip,
            action,
            shouldOwn = false,
            root,
        }) {
            Log.debug(
                `${MODULE_NAME}//Logic//${MODEL_NAME}//${action}`,
                ip,
                root
            );
            let filter;
            if (shouldOwn) {
                filter = {
                    [ownerFieldName]: activeUser?._id,
                };
            }
            const result = await getModel().listAll(filter);
            LogAction({
                action,
                by: activeUser?._id,
                role: activeUser?.role,
                ip,
                root,
                shouldOwn,
            });
            return result;
        }

        static async listAll({ activeUser, ip, root }) {
            return await this._listAll({
                activeUser,
                ip,
                root,
                action: "listAll",
                shouldOwn: false,
            });
        }

        static async listAllOwn({ activeUser, ip, root }) {
            return await this._listAll({
                activeUser,
                ip,
                root,
                action: "listAllOwn",
                shouldOwn: true,
            });
        }

        static async _listAndCount({
            query,
            activeUser,
            ip,
            action,
            root,
            shouldOwn = false,
        }) {
            Log.debug(
                `${MODULE_NAME}//Logic//${MODEL_NAME}//${action}`,
                ip,
                root
            );
            const { skip, size, sorter, filter, search } = query;
            let populate = await getPopulate(action, {
                activeUser,
                ip,
            });
            if (shouldOwn) {
                notFilter.filter.modifyRules(filter, {
                    [ownerFieldName]: activeUser?._id,
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
            LogAction({
                action,
                by: activeUser?._id,
                role: activeUser?.role,
                ip,
                root,
                shouldOwn,
            });
            return result;
        }

        static async listAndCount({ query, activeUser, ip, root }) {
            return await this._listAndCount({
                query,
                activeUser,
                ip,
                root,
                action: "listAndCount",
                shouldOwn: false,
            });
        }

        static async listAndCountOwn({ query, activeUser, ip, root }) {
            return await this._listAndCount({
                query,
                activeUser,
                ip,
                root,
                action: "listAndCountOwn",
                shouldOwn: true,
            });
        }

        static async _list({
            query,
            activeUser,
            ip,
            action,
            root,
            shouldOwn = false,
        }) {
            Log.debug(
                `${MODULE_NAME}//Logic//${MODEL_NAME}//${action}`,
                ip,
                root
            );
            const { skip, size, sorter, filter } = query;
            let populate = await getPopulate(action, {
                activeUser,
                ip,
            });
            if (shouldOwn) {
                notFilter.filter.modifyRules(filter, {
                    [ownerFieldName]: activeUser?._id,
                });
            }
            const result = await getModel().listAndPopulate(
                skip,
                size,
                sorter,
                filter,
                populate
            );
            LogAction({
                action,
                by: activeUser?._id,
                role: activeUser?.role,
                ip,
                root,
                shouldOwn,
            });
            return result;
        }

        static async list({ query, activeUser, ip, root }) {
            return await this._list({
                query,
                activeUser,
                ip,
                root,
                action: "list",
                shouldOwn: false,
            });
        }

        static async listOwn({ query, activeUser, ip, root }) {
            return await this._list({
                query,
                activeUser,
                ip,
                root,
                action: "listOwn",
                shouldOwn: true,
            });
        }

        static async _count({
            query,
            activeUser,
            ip,
            action,
            root,
            shouldOwn = false,
        }) {
            Log.debug(
                `${MODULE_NAME}//Logic//${MODEL_NAME}//${action}`,
                ip,
                root
            );
            const { filter, search } = query;
            if (shouldOwn) {
                notFilter.filter.modifyRules(filter, {
                    [ownerFieldName]: activeUser?._id,
                });
            }
            if (search) {
                notFilter.filter.modifyRules(search, filter);
            }
            const result = await getModel().countWithFilter(search || filter);
            LogAction({
                action,
                by: activeUser?._id,
                role: activeUser?.role,
                ip,
                root,
                shouldOwn,
            });
            return result;
        }

        static async count({ query, activeUser, ip, root }) {
            return await this._count({
                query,
                activeUser,
                ip,
                root,
                action: "count",
                shouldOwn: false,
            });
        }

        static async countOwn({ query, activeUser, ip, root }) {
            return await this._count({
                query,
                activeUser,
                ip,
                root,
                action: "countOwn",
                shouldOwn: true,
            });
        }
    };
};

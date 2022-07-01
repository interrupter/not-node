const { objHas, isFunc, executeFunctionAsAsync } = require("../common");
const ModelRoutine = require("../model/routine");
const { deleteResponseSuccess } = require("../model/utils.js");
const { DBExceptionDeleteWasNotSuccessful } = require("../exceptions/db.js");
const {
    DBExceptionDocumentIsNotOwnerByActiveUser,
} = require("../exceptions/http");
const isOwnerImported = require("../auth/fields.js").isOwner;
const { DOCUMENT_OWNER_FIELD_NAME } = require("../auth/const.js");
const notFilter = require("not-filter").filter;

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
                data[ownerFieldName] = activeUser._id;
            }
            const res = await getModel().add(data);
            LogAction(
                {
                    action,
                    by: activeUser._id,
                    role: activeUser.role,
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
         * @param {Object}  prepared
         * @param {Object}  prepared.data           data extracted from request
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
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
         * @param {Object}  prepared
         * @param {Object}  prepared.data           data extracted from request
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
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

        async _updateOne({
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
                query[ownerFieldName] = activeUser._id;
            }
            const result = await getModel().update(query, data).exec();
            LogAction(
                {
                    action,
                    by: activeUser._id,
                    role: activeUser.role,
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
         * @param {Object}  prepared
         * @param {Object}  prepared.targetId       target item _id
         * @param {Object}  prepared.data           data extracted from request
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
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
         * @param {Object}  prepared
         * @param {Object}  prepared.targetId       target item _id
         * @param {Object}  prepared.data           data extracted from request
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
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
         * @param {Object}  prepared
         * @param {Object}  prepared.targetId       target item _id
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
         * @param {boolean}  prepared.shouldOwn     if user should be owner of target
         * @returns {Promise<Object>}               requested document
         **/
        async _getOne({
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
                query[ownerFieldName] = activeUser._id;
            }
            let populate = getPopulate(action, {
                targetId,
                activeUser,
                ip,
                root,
            });
            const result = await getModel().getOne(targetId, populate, query);
            LogAction(
                {
                    action,
                    by: activeUser._id,
                    role: activeUser.role,
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
         * @param {Object}  prepared
         * @param {Object}  prepared.targetId       target item _id
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
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
         * @param {Object}  prepared
         * @param {Object}  prepared.targetId       target item _id
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
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
         * get item without populated sub-documents
         * @param {Object}  prepared
         * @param {Object}  prepared.targetId       target item _id
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
         * @param {boolean}  prepared.shouldOwn     if user should be owner of target
         * @returns {Promise<Object>}               requested document
         **/
        async _getOneRaw({
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
                query[ownerFieldName] = activeUser._id;
            }
            const result = await getModel().getOneRaw(targetId, query);
            LogAction(
                {
                    action,
                    by: activeUser._id,
                    role: activeUser.role,
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
         * @param {Object}  prepared
         * @param {Object}  prepared.targetId       target item _id
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
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
         * @param {Object}  prepared
         * @param {Object}  prepared.targetId       target item _id
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
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
         * @param {Object}  prepared
         * @param {Object}  prepared.targetId       target item _id
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
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
                if (shouldOwn && !isOwner(itm, activeUser)) {
                    throw new DBExceptionDocumentIsNotOwnerByActiveUser({
                        params: {
                            targetId,
                            activeUserId: activeUser._id,
                            role: activeUser.role,
                            versioning,
                        },
                    });
                } else {
                    await itm.close();
                }
            } else {
                let query = { _id: targetId };
                if (shouldOwn) {
                    query[ownerFieldName] = activeUser._id;
                }
                const result = await model.findOneAndDelete(query).exec();
                if (!deleteResponseSuccess(result)) {
                    throw new DBExceptionDeleteWasNotSuccessful({
                        params: {
                            result,
                            targetId,
                            activeUserId: activeUser._id,
                            role: activeUser.role,
                            versioning,
                        },
                    });
                }
            }
            LogAction(
                {
                    action,
                    by: activeUser._id,
                    role: activeUser.role,
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
         * @param {Object}  prepared
         * @param {Object}  prepared.targetId       target item _id
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
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
         * @param {Object}  prepared
         * @param {Object}  prepared.targetId       target item _id
         * @param {Object}  prepared.activeUser     current user info
         * @param {string}  prepared.ip             current user ip
         * @param {boolean}  prepared.root          current user is root
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
                    [ownerFieldName]: activeUser._id,
                };
            }
            const result = await getModel().listAll(filter);
            LogAction({
                action,
                by: activeUser._id,
                role: activeUser.role,
                ip,
                root,
                shouldOwn,
            });
            return result;
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
            let populate = getPopulate(action, {
                activeUser,
                ip,
            });
            if (shouldOwn) {
                notFilter.fitler.modifyRules(filter, {
                    [ownerFieldName]: activeUser._id,
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
                by: activeUser._id,
                role: activeUser.role,
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
    };
};

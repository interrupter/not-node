const notFilter = require("not-filter");
const {
    DOCUMENT_OWNER_FIELD_NAME,
    DOCUMENT_SESSION_FIELD_NAME,
} = require("../../../auth/const.js");
const {
    OwnageExceptionIdentityUserIdIsNotDefined,
} = require("../../../exceptions/action.js");
const ModelRoutine = require("../../../model/routine.js");

//checks that
module.exports = class OwnageBeforeAction {
    static #ownerFieldName = DOCUMENT_OWNER_FIELD_NAME;
    static #sessionFieldName = DOCUMENT_SESSION_FIELD_NAME;

    static get ownerFieldName() {
        return this.#ownerFieldName;
    }

    static get sessionFieldName() {
        return this.#sessionFieldName;
    }

    static setOwnage(logic, actionName, args, ownageFilter) {
        const { query, targetId, targetID } = args;
        let { filter, search } = query;
        if (filter) {
            filter = notFilter.filter.modifyRules(filter, ownageFilter);
            if (search) {
                search = notFilter.filter.modifyRules(search, filter);
            }
        }
        args.defaultQueryById = {
            _id: targetId,
            ...ownageFilter,
        };
        const Model = logic.getModel();
        const incFieldName = ModelRoutine.incremental(Model);
        if (incFieldName) {
            args.defaultQueryByID = {
                [incFieldName]: targetID,
                ...ownageFilter,
            };
        }

        args.defaultQueryMany = {
            ...ownageFilter,
        };
        //mark data as owned by
        if (typeof args.data == "object" && args.data) {
            Object.assign(args.data, ownageFilter);
        }
    }

    static createOwnageFilterForUser(identity) {
        return Object.freeze({
            [OwnageBeforeAction.ownerFieldName]: identity.uid,
        });
    }

    static createOwnageFilterForSession(identity) {
        return Object.freeze({
            [OwnageBeforeAction.sessionFieldName]: identity.sid,
        });
    }

    /**
     * Returns object with filtering conditions to restrict access by owner or session
     *
     * @static
     * @param {import('../../../types.js').notAppIdentityData} identity
     * @return {object}
     */
    static getOwnageFilterForIdentity(identity) {
        if (identity.uid) {
            return OwnageBeforeAction.createOwnageFilterForUser(identity);
        } else if (identity.sid) {
            return OwnageBeforeAction.createOwnageFilterForSession(identity);
        } else {
            return null;
        }
    }

    /**
     *
     *
     * @static
     * @param {import('../../logic.js')} logic
     * @param {String} actionName
     * @param {import('../../../types.js').PreparedData} args
     */
    static async run(logic, actionName, args) {
        if (!args.identity) {
            throw new OwnageExceptionIdentityUserIdIsNotDefined(
                actionName,
                undefined
            );
        }
        const ownageFilter = OwnageBeforeAction.getOwnageFilterForIdentity(
            args.identity
        );
        if (ownageFilter === null) {
            throw new OwnageExceptionIdentityUserIdIsNotDefined(
                actionName,
                args.identity
            );
        }
        OwnageBeforeAction.setOwnage(logic, actionName, args, ownageFilter);
    }

    static ifActionNameEndsWith_Own() {
        return Object.freeze({
            condition: (actionName) => actionName.endsWith("Own"),
            action: OwnageBeforeAction,
        });
    }
};

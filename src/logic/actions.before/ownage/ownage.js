const {
    DOCUMENT_OWNER_FIELD_NAME,
    DOCUMENT_SESSION_FIELD_NAME,
} = require("../../../auth/const.js");
const {
    OwnageExceptionIdentityUserIdIsNotDefined,
} = require("../../../exceptions/action.js");

const StandartQueriesBeforeAction = require("../standart.queries.js");

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
        StandartQueriesBeforeAction.modifyQueries(args, ownageFilter);
    }

    static ifActionNameEndsWith_Own() {
        return Object.freeze({
            condition: (actionName) => actionName.endsWith("Own"),
            action: OwnageBeforeAction,
        });
    }
};

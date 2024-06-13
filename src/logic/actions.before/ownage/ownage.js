const notFilter = require("not-filter");
const { DOCUMENT_OWNER_FIELD_NAME } = require("../../../auth/const.js");
const {
    OwnageExceptionIdentityUserIdIsNotDefined,
} = require("../../../exceptions/action.js");
const ModelRoutine = require("../../../model/routine.js");

//checks that
module.exports = class OwnageBeforeAction {
    static #ownerFieldName = DOCUMENT_OWNER_FIELD_NAME;

    static get ownerFieldName() {
        return this.#ownerFieldName;
    }

    static async run(logic, actionName, args) {
        const { identity, data, query, targetId, targetID } = args;
        if (identity.uid) {
            //if searching, counting, listing and so on
            //adding condition of ownership by this excat user
            let { filter, search } = query;
            if (filter) {
                filter = notFilter.filter.modifyRules(filter, {
                    [OwnageBeforeAction.ownerFieldName]: identity?.uid,
                });
                if (search) {
                    search = notFilter.filter.modifyRules(search, filter);
                }
            }
            args.defaultQueryById = {
                _id: targetId,
                [OwnageBeforeAction.ownerFieldName]: identity?.uid,
            };
            const Model = logic.getModel();
            const incFieldName = ModelRoutine.incremental(Model);
            if (incFieldName) {
                args.defaultQueryByID = {
                    [incFieldName]: targetID,
                    [OwnageBeforeAction.ownerFieldName]: identity?.uid,
                };
            }

            args.defaultQueryMany = {
                [OwnageBeforeAction.ownerFieldName]: identity?.uid,
            };
            //mark data as owned by
            if (data) {
                data[OwnageBeforeAction.ownerFieldName] = identity.uid;
            }
        } else {
            throw new OwnageExceptionIdentityUserIdIsNotDefined(
                actionName,
                identity
            );
        }
    }
};

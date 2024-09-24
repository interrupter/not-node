const notFilter = require("not-filter");
const ModelRoutine = require("../../model/routine.js");

//adds to args object few basic queries
module.exports = class StandartQueriesBeforeAction {
    static modifyQueries(args, modificationFilter) {
        const { query } = args;
        let { filter, search } = query;
        if (filter) {
            filter = notFilter.filter.modifyRules(filter, modificationFilter);
            if (search) {
                search = notFilter.filter.modifyRules(search, filter);
            }
        }
        if (args.defaultQueryById) {
            args.defaultQueryById = notFilter.filter.modifyRules(
                args.defaultQueryById,
                modificationFilter
            );
        }
        if (args.defaultQueryByID) {
            args.defaultQueryByID = notFilter.filter.modifyRules(
                args.defaultQueryByID,
                modificationFilter
            );
        }

        args.defaultQueryMany = notFilter.filter.modifyRules(
            args.defaultQueryMany,
            modificationFilter
        );

        //mark data as owned by
        if (typeof args.data == "object" && args.data) {
            Object.assign(args.data, modificationFilter);
        }
    }

    static async run(logic, actionName, args) {
        try {
            const { targetId, targetID } = args;
            if (targetId) {
                args.defaultQueryById = {
                    _id: targetId,
                };
            }
            const Model = logic.getModel();
            const incFieldName = ModelRoutine.incremental(Model);
            if (
                incFieldName &&
                typeof targetID === "number" &&
                !isNaN(targetID) &&
                targetID
            ) {
                args.defaultQueryByID = {
                    [incFieldName]: targetID,
                };
            }
            args.defaultQueryMany = {};
        } catch (e) {
            logic.log.error(e);
        }
    }
};

const ModelRoutine = require("../../model/routine.js");

//adds to args object few basic queries
module.exports = class StandartQueriesBeforeAction {
    static async run(logic, actionName, args) {
        try {
            const { targetId, targetID } = args;
            args.defaultQueryById = {
                _id: targetId,
            };
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

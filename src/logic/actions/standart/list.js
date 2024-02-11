const { LogicListActionException } = require("../../../exceptions/action");

module.exports = class ListAction {
    static async run(logic, actionName, { identity, query }) {
        try {
            logic.logDebugAction(actionName, identity);
            const { skip, size, sorter, filter } = query;
            let populate = await logic.getPopulate(actionName, {
                identity,
            });
            const result = await logic
                .getModel()
                .listAndPopulate(skip, size, sorter, filter, populate);
            logic.logAction(actionName, identity, {});
            return result;
        } catch (e) {
            throw new LogicListActionException(
                {
                    query,
                    activeUserId: identity?.uid,
                    role: identity?.role,
                },
                e
            );
        }
    }
};

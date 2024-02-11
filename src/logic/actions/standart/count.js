const { LogicCountActionException } = require("../../../exceptions/action");

module.exports = class CountAction {
    static async run(logic, actionName, { identity, query }) {
        try {
            logic.logDebugAction(actionName, identity);
            const { filter, search } = query;
            const result = await logic
                .getModel()
                .countWithFilter(search || filter);
            logic.logAction(actionName, identity);
            return result;
        } catch (e) {
            throw new LogicCountActionException(
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

const {
    LogicListAndCountActionException,
} = require("../../../exceptions/action");

module.exports = class ListAndCountAction {
    static async run(logic, actionName, { identity, query }) {
        try {
            logic.logDebugAction(actionName, identity);
            const { skip, size, sorter, filter, search } = query;
            let populate = await logic.getPopulate(actionName, {
                identity,
            });
            const result = await logic
                .getModel()
                .listAndCount(skip, size, sorter, filter, search, populate);
            result.list = result.list.map((item) => item.toObject());
            logic.logAction(actionName, identity, {});
            return result;
        } catch (e) {
            throw new LogicListAndCountActionException(
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

const { LogicListAllActionException } = require("../../../exceptions/action");

module.exports = class ListAllAction {
    static async run(logic, actionName, { identity, defaultQueryMany }) {
        try {
            logic.logDebugAction(actionName, identity);
            const result = await logic.getModel().listAll(defaultQueryMany);
            logic.logAction(actionName, identity, {});
            return result;
        } catch (e) {
            throw new LogicListAllActionException(
                {
                    query: defaultQueryMany,
                    activeUserId: identity?.uid,
                    role: identity?.role,
                },
                e
            );
        }
    }
};

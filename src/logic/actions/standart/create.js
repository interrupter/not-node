const { LogicCreateActionException } = require("../../../exceptions/action");
module.exports = class CreateAction {
    static async run(logic, actionName, { identity, data }) {
        try {
            logic.logDebugAction(actionName, identity);
            const result = await logic.getModel().add(data);
            logic.logAction(actionName, identity, {
                targetId: result?._id,
            });
            return result;
        } catch (e) {
            throw new LogicCreateActionException(
                {
                    activeUserId: identity?.uid,
                    role: identity?.role,
                },
                e
            );
        }
    }
};

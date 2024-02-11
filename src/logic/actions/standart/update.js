const { LogicUpdateActionException } = require("../../../exceptions/action");
module.exports = class UpdateAction {
    static async run(
        logic,
        actionName,
        { identity, data, targetId, defaultQueryById }
    ) {
        try {
            logic.logDebugAction(actionName, identity);
            const result = await logic
                .getModel()
                .update(defaultQueryById, data);
            logic.logAction(actionName, identity, {
                targetId,
                version: result?.__version,
            });
            return result;
        } catch (e) {
            throw new LogicUpdateActionException(
                {
                    targetId,
                    query: defaultQueryById,
                    activeUserId: identity?.uid,
                    role: identity?.role,
                },
                e
            );
        }
    }
};

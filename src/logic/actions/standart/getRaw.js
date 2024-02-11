const { LogicGetRawActionException } = require("../../../exceptions/action");

module.exports = class GetRawAction {
    static async run(
        logic,
        actionName,
        { identity, defaultQueryById, targetId }
    ) {
        try {
            logic.logDebugAction(actionName, identity);
            const result = await logic
                .getModel()
                .getOneRaw(targetId, defaultQueryById);
            logic.logAction(actionName, identity, {
                targetId,
                version: result?.__version,
            });
            return result;
        } catch (e) {
            throw new LogicGetRawActionException(
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

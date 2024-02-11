const { LogicGetActionException } = require("../../../exceptions/action");

module.exports = class GetAction {
    static async run(
        logic,
        actionName,
        { identity, defaultQueryById, targetId }
    ) {
        try {
            logic.logDebugAction(actionName, identity);

            let populate = await logic.getPopulate(actionName, {
                targetId,
                identity,
            });

            const result = await logic
                .getModel()
                .getOne(targetId, populate, defaultQueryById);

            logic.logAction(actionName, identity, {
                targetId,
                version: result?.__version,
            });
            return result;
        } catch (e) {
            throw new LogicGetActionException(
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

const { LogicDeleteActionException } = require("../../../exceptions/action.js");
module.exports = class DeleteAction {
    static async run(
        logic,
        actionName,
        { identity, defaultQueryById, targetId }
    ) {
        logic.logDebugAction(actionName, identity);
        /** @type {import('../../../types.js').notAppModel } */
        const model = logic.getModel();
        try {
            await model.removeOne(defaultQueryById);
            logic.logAction(actionName, identity, {
                query: defaultQueryById,
            });
        } catch (e) {
            throw new LogicDeleteActionException(
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

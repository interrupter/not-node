module.exports = class GetRawAction {
    static async run(
        logic,
        actionName,
        { identity, defaultQueryById, targetId }
    ) {
        logic.logDebugAction(actionName, identity);
        const result = await logic
            .getModel()
            .getOneRaw(targetId, defaultQueryById);
        logic.logAction(actionName, identity, {
            targetId,
            version: result?.__version,
        });
        return result;
    }
};

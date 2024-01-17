module.exports = class UpdateAction {
    static async run(
        logic,
        actionName,
        { identity, data, targetId, defaultQueryById }
    ) {
        logic.logDebugAction(actionName, identity);
        const result = await logic.getModel().update(defaultQueryById, data);
        logic.logAction(actionName, identity, {
            targetId,
            version: result?.__version,
        });
        return result;
    }
};

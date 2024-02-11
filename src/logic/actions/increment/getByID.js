module.exports = class GetByIDAction {
    static async run(
        logic,
        actionName,
        { targetID, identity, defaultQueryByID }
    ) {
        logic.logDebugAction(actionName, identity);

        let populate = await logic.getPopulate(actionName, {
            targetID,
            identity,
        });

        const result = await logic
            .getModel()
            .getOneByID(targetID, defaultQueryByID, populate);
        logic.logAction(actionName, identity, {
            targetID,
            version: result?.__version,
        });
        return result;
    }
};

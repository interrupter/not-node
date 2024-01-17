module.exports = class CreateAction {
    static async run(logic, actionName, { identity, data }) {
        logic.logDebugAction(actionName, identity);
        const result = await logic.getModel().add(data);
        logic.logAction(actionName, identity, {
            targetId: result?._id,
        });
        return result;
    }
};

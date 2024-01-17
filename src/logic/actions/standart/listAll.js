module.exports = class ListAllAction {
    static async run(logic, actionName, { identity, defaultQueryMany }) {
        logic.logDebugAction(actionName, identity);
        const result = await logic.lgetModel().listAll(defaultQueryMany);
        logic.logAction(actionName, identity, {});
        return result;
    }
};

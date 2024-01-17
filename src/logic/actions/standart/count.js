module.exports = class CountAction {
    static async run(logic, actionName, { identity, query }) {
        logic.logDebugAction(actionName, identity);
        const { filter, search } = query;
        const result = await logic.getModel().countWithFilter(search || filter);
        logic.logAction(actionName, identity);
        return result;
    }
};

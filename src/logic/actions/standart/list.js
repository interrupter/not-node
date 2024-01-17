module.exports = class ListAction {
    static async run(logic, actionName, { identity, query }) {
        logic.logDebugAction(actionName, identity);
        const { skip, size, sorter, filter } = query;
        let populate = await logic.getPopulate(actionName, {
            identity,
        });
        const result = await logic
            .getModel()
            .listAndPopulate(skip, size, sorter, filter, populate);
        logic.logAction(actionName, identity, {});
        return result;
    }
};

module.exports = class ListAndCountAction {
    static async run(logic, actionName, { identity, query }) {
        logic.logDebugAction(actionName, identity);
        const { skip, size, sorter, filter, search } = query;
        let populate = await logic.getPopulate(actionName, {
            identity,
        });
        const result = await logic
            .getModel()
            .listAndCount(skip, size, sorter, filter, search, populate);
        logic.logAction(actionName, identity, {});
        return result;
    }
};

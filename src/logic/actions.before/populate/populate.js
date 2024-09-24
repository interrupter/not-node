module.exports = class PopulateBeforeAction {
    static async run(logic, actionName, args) {
        try {
            const { identity } = args;
            args.populate = await logic.getPopulate(actionName, {
                identity,
            });
        } catch (e) {
            logic.log.error(e);
        }
    }
};

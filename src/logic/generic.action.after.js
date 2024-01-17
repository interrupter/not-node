//reference only
module.exports = class GenericAfterAction {
    static async run(logic, actionName, actionResult, ...args) {
        return [...args];
    }
};

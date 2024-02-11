//reference only
module.exports = class GenericBeforeAction {
    static async run(logic, actionName, ...args) {
        return [...args];
    }
};

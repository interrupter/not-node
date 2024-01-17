const { ActionExceptionWrongType } = require("../exceptions/action.js");

class ActionRunner {
    static async run(action, params) {
        //any static class with static run method
        if (typeof action === "function" && typeof action.run === "function") {
            return await action.run(...params);
        } else if (typeof action === "function") {
            return await action(...params);
        }
        throw new ActionExceptionWrongType();
    }
}

module.exports = ActionRunner;

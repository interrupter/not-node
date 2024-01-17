const notRequestError = require("not-error/src/request.error.node.cjs");

//delete wasnt successful, or error, or count of deleted documents dont match requested
class LogicExceptionActionExecutionError extends notRequestError {
    constructor(actionName, cause) {
        super(
            "Logic cant run this action",
            { code: 505, params: { actionName } },
            cause
        );
    }
}
module.exports.LogicExceptionActionExecutionError =
    LogicExceptionActionExecutionError;

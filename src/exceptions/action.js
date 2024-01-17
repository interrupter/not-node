const notRequestError = require("not-error/src/request.error.node.cjs");

//delete wasnt successful, or error, or count of deleted documents dont match requested
class ActionExceptionWrongType extends notRequestError {
    constructor({ params = {}, cause = null } = {}) {
        super("Logic cant run this action", { code: 505, params }, cause);
    }
}
module.exports.ActionExceptionWrongType = ActionExceptionWrongType;

class ActionExceptionPipeExecutionError extends notRequestError {
    constructor({ params = {}, cause = null } = {}) {
        super(
            "Logic cant run this actions sequence",
            { code: 505, params },
            cause
        );
    }
}
module.exports.ActionExceptionPipeExecutionError =
    ActionExceptionPipeExecutionError;

class OwnageExceptionIdentityUserIdIsNotDefined extends notRequestError {
    constructor(actionName, identity) {
        super(
            "User identity `uid` is not defined, ownage couldnt be determined",
            { code: 505, params: { actionName, identity } },
            null
        );
    }
}
module.exports.OwnageExceptionIdentityUserIdIsNotDefined =
    OwnageExceptionIdentityUserIdIsNotDefined;

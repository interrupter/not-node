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

class ActionExceptionIdentitySessionIsNotDefined extends notRequestError {
    constructor(actionName, identity) {
        super(
            "User identity `sid` is not defined",
            { code: 505, params: { actionName, identity } },
            null
        );
    }
}
module.exports.ActionExceptionIdentitySessionIsNotDefined =
    ActionExceptionIdentitySessionIsNotDefined;

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

class OwnageExceptionIdentityUserIdAndSessionIsNotDefined extends notRequestError {
    constructor(actionName, identity) {
        super(
            "User identity `uid` and `sid` is not defined, ownage couldnt be determined",
            { code: 505, params: { actionName, identity } },
            null
        );
    }
}
module.exports.OwnageExceptionIdentityUserIdAndSessionIsNotDefined =
    OwnageExceptionIdentityUserIdAndSessionIsNotDefined;

class LogicDeleteActionException extends notRequestError {
    constructor(params, cause) {
        super("Logic Delete Action exception", { code: 505, params }, cause);
    }
}
module.exports.LogicDeleteActionException = LogicDeleteActionException;

class LogicCreateActionException extends notRequestError {
    constructor(params, cause) {
        super("Logic Create Action exception", { code: 505, params }, cause);
    }
}
module.exports.LogicCreateActionException = LogicCreateActionException;
class LogicUpdateActionException extends notRequestError {
    constructor(params, cause) {
        super("Logic Update Action exception", { code: 505, params }, cause);
    }
}
module.exports.LogicUpdateActionException = LogicUpdateActionException;

class LogicCountActionException extends notRequestError {
    constructor(params, cause) {
        super("Logic Count Action exception", { code: 505, params }, cause);
    }
}
module.exports.LogicCountActionException = LogicCountActionException;

class LogicListAndCountActionException extends notRequestError {
    constructor(params, cause) {
        super(
            "Logic ListAndCount Action exception",
            { code: 505, params },
            cause
        );
    }
}
module.exports.LogicListAndCountActionException =
    LogicListAndCountActionException;

class LogicGetActionException extends notRequestError {
    constructor(params, cause) {
        super("Logic Get Action exception", { code: 505, params }, cause);
    }
}
module.exports.LogicGetActionException = LogicGetActionException;

class LogicGetRawActionException extends notRequestError {
    constructor(params, cause) {
        super("Logic GetRaw Action exception", { code: 505, params }, cause);
    }
}
module.exports.LogicGetRawActionException = LogicGetRawActionException;

class LogicListActionException extends notRequestError {
    constructor(params, cause) {
        super("Logic List Action exception", { code: 505, params }, cause);
    }
}
module.exports.LogicListActionException = LogicListActionException;

class LogicListAllActionException extends notRequestError {
    constructor(params, cause) {
        super("Logic ListAll Action exception", { code: 505, params }, cause);
    }
}
module.exports.LogicListAllActionException = LogicListAllActionException;

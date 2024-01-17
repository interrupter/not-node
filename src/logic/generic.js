const actionsSetsLibrary = require("./actions/index.js");
const LogicProxied = require("./logic.js");

module.exports = ({
    target,
    LogicConstructor = LogicProxied,
    MODULE_NAME,
    MODEL_NAME,
    actionRunner = undefined,
    actionsSets = ["standart"],
    actions = {},
    beforeActions = {},
    beforeActionsAll = [],
    afterActions = {},
    afterActionsAll = [],
}) => {
    //start with empty set
    const ACTIONS = {};
    //add all from actions sets library
    actionsSets.forEach((setName) => {
        actionsSetsLibrary[setName] &&
            Object.assign(ACTIONS, actionsSetsLibrary[setName]);
    });
    //add user defined
    Object.assign(ACTIONS, actions);

    const Logic = new LogicConstructor(ACTIONS, actionRunner, {
        MODULE_NAME,
        MODEL_NAME,
        target,
    });

    beforeActionsAll.forEach((action) => Logic.onBefore(undefined, action));
    afterActionsAll.forEach((action) => Logic.onAfter(undefined, action));

    Object.keys(beforeActions).forEach((actionName) =>
        beforeActions[actionName].forEach((action) =>
            Logic.onBefore(actionName, action)
        )
    );

    Object.keys(afterActions).forEach((actionName) =>
        afterActions[actionName].forEach((action) =>
            Logic.onAfter(actionName, action)
        )
    );

    return Logic;
};

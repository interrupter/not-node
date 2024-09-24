const actionsSetsLibrary = require("./actions/index.js");
const LogicProxied = require("./logic.js");

module.exports = ({
    target,
    LogicConstructor = LogicProxied,
    MODULE_NAME,
    MODEL_NAME,
    USER_MODEL_NAME = "not-user//User",
    actionRunner = undefined,
    actionsSets = ["standart"],
    actions = {},
    beforeActions = {},
    beforeActionsOnCondition = [
        require("./actions.before/ownage/ownage.js").ifActionNameEndsWith_Own(),
    ], //each item = {condition: (actionName)=>boolean, action}
    beforeActionsAll = [
        require("./actions.before/standart.queries.js"),
        require("./actions.before/populate/populate.js"),
    ],
    afterActions = {},
    afterActionsOnCondition = [], //each item = {condition: (actionName)=>boolean, action}
    populateBuilders = {},
    afterActionsAll = [],
    defaultPopulate = [],
}) => {
    //start with empty set
    const ACTIONS = {};
    //add all from actions sets library
    actionsSets.forEach((setName) => {
        actionsSetsLibrary.has(setName) &&
            Object.assign(ACTIONS, actionsSetsLibrary.get(setName));
    });
    //add user defined
    Object.assign(ACTIONS, actions);

    const Logic = new LogicConstructor(ACTIONS, actionRunner, {
        MODULE_NAME,
        MODEL_NAME,
        target,
        USER_MODEL_NAME,
        populateBuilders,
        defaultPopulate,
    });

    //adds before/after to all
    beforeActionsAll.forEach((action) => {
        Logic.onBefore(undefined, action);
    });

    afterActionsAll.forEach((action) => Logic.onAfter(undefined, action));

    //adds before/after to as many as satisfies condition
    Object.keys(ACTIONS).forEach((actionName) => {
        beforeActionsOnCondition.forEach(({ condition, action }) => {
            if (condition(actionName)) {
                Logic.onBefore(actionName, action);
            }
        });
        afterActionsOnCondition.forEach(({ condition, action }) => {
            if (condition(actionName)) {
                Logic.onAfter(actionName, action);
            }
        });
    });

    //adds before/after per actionName
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

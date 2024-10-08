const getApp = require("../getApp.js"),
    configInit = require("not-config"),
    { sayForModule, modulePhrase } = require("not-locale"),
    LogInit = require("not-log"),
    { objHas, isFunc, executeFunctionAsAsync } = require("../common.js");

const NamedActionPipes = require("./named.actions.pipes.js");
const ActionRunner = require("./action.runner.js");
const {
    LogicExceptionActionExecutionError,
} = require("../exceptions/logic.js");

class LogicProxied {
    afterPipes;
    beforePipes;

    actions = new Map();
    actionRunner = ActionRunner;

    #populateBuilders = {};
    get populateBuilders() {
        return this.#populateBuilders;
    }

    #defaultPopulate = [];
    get defaultPopulate() {
        return this.#defaultPopulate;
    }

    MODEL_NAME;
    MODULE_NAME;
    USER_MODEL_NAME = "";

    #proxy;
    log;
    say;
    phrase;
    config;
    logAction;
    logDebugAction;

    constructor(
        actions = {},
        actionRunner = ActionRunner,
        {
            MODULE_NAME,
            MODEL_NAME,
            target,
            defaultPopulate,
            populateBuilders,
            USER_MODEL_NAME = "not-user//User",
        }
    ) {
        this.MODEL_NAME = MODEL_NAME;
        this.MODULE_NAME = MODULE_NAME;
        this.USER_MODEL_NAME = USER_MODEL_NAME;
        if (defaultPopulate) {
            this.#defaultPopulate = defaultPopulate;
        }
        Object.freeze(this.#defaultPopulate);

        if (populateBuilders) {
            this.#populateBuilders = populateBuilders;
        }
        Object.freeze(this.#populateBuilders);

        actionRunner && (this.actionRunner = actionRunner);
        this.afterPipes = new NamedActionPipes(
            NamedActionPipes.PIPE_TYPES.CONSECUTIVE,
            this.actionRunner
        );
        this.beforePipes = new NamedActionPipes(
            NamedActionPipes.PIPE_TYPES.CONSECUTIVE,
            this.actionRunner
        );

        Object.keys(actions).forEach((actionName) => {
            this.actions.set(actionName, actions[actionName]);
        });

        this.#initTools(target);

        // proxy logic, do something before each call of all methods inside class
        // like if arg passed is 3, print something additionally
        return (this.#proxy = new Proxy(this, {
            get(target, prop) {
                if (target.actions.has(prop)) {
                    return target.#getActionRunner(prop);
                } else {
                    return target[prop];
                }
            },
        }));
    }

    #initTools(target) {
        this.log = LogInit(
            target,
            `${this.MODULE_NAME}//Logic//${this.MODEL_NAME}`
        );
        this.say = sayForModule(this.MODULE_NAME);
        this.phrase = modulePhrase(this.MODULE_NAME);
        this.config = configInit.readerForModule(this.MODULE_NAME);

        this.logAction = (actionName, identity, params = {}) => {
            this.log &&
                this.log.log({
                    time: new Date(),
                    module: this.MODULE_NAME,
                    logic: this.MODEL_NAME,
                    action: actionName,
                    ...identity,
                    params,
                });
        };
        this.logDebugAction = (action, identity) => {
            this.log &&
                this.log.debug(
                    new Date(),
                    `${this.MODULE_NAME}//Logic//${this.MODEL_NAME}//${action}`,
                    identity?.ip,
                    identity?.root
                );
        };
    }

    getModel() {
        return getApp().getModel(`${this.MODULE_NAME}//${this.MODEL_NAME}`);
    }

    getModelSchema() {
        return getApp().getModelSchema(
            `${this.MODULE_NAME}//${this.MODEL_NAME}`
        );
    }

    getModelUser() {
        return this.USER_MODEL_NAME
            ? getApp().getModel(this.USER_MODEL_NAME)
            : undefined;
    }

    async getPopulate(actionName, prepared) {
        if (
            this.populateBuilders &&
            objHas(this.populateBuilders, actionName) &&
            isFunc(this.populateBuilders[actionName])
        ) {
            return await executeFunctionAsAsync(
                this.populateBuilders[actionName],
                [prepared]
            );
        }
        return [...this.defaultPopulate];
    }

    #getActionRunner(actionName) {
        return async (...args) => {
            try {
                const action = this.actions.get(actionName);
                await this.beforeAction(actionName, [
                    this.#proxy,
                    actionName,
                    ...args,
                ]);
                const actionResult = await this.actionRunner.run(action, [
                    this.#proxy,
                    actionName,
                    ...args,
                ]);
                await this.afterAction(actionName, [
                    this.#proxy,
                    actionName,
                    actionResult,
                    ...args,
                ]);
                return actionResult;
            } catch (e) {
                throw new LogicExceptionActionExecutionError(
                    this.MODULE_NAME,
                    this.MODEL_NAME,
                    actionName,
                    e
                );
            }
        };
    }

    async beforeAction(actionName, args) {
        await this.beforePipes.execute(actionName, args);
    }

    async afterAction(actionName, args) {
        await this.afterPipes.execute(actionName, args);
    }

    onAfter(name, action) {
        this.afterPipes.add(name, action);
    }

    offAfter(name, action) {
        this.afterPipes.remove(name, action);
    }

    onBefore(name, action) {
        this.beforePipes.add(name, action);
    }

    offBefore(name, action) {
        this.beforePipes.remove(name, action);
    }
}

module.exports = LogicProxied;

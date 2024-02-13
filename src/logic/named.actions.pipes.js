const { objHas } = require("../common.js");
const {
    ActionExceptionPipeExecutionError,
} = require("../exceptions/action.js");

const ActionRunner = require("./action.runner.js");

const CONSECUTIVE = 1;
const PARALLEL = 2;

const PIPE_TYPES = { CONSECUTIVE, PARALLEL };
Object.freeze(PIPE_TYPES);

class NamedActionPipes {
    static PIPE_TYPES = PIPE_TYPES;
    #type = CONSECUTIVE;
    #all = [];
    #named = {};
    actionRunner = ActionRunner;

    constructor(type = CONSECUTIVE, actionRunner = ActionRunner) {
        this.#type = type;
        actionRunner && (this.actionRunner = actionRunner);
    }

    get type(){
        return this.#type;
    }

    add(name, action) {
        if (typeof name === "undefined") {
            this.addToPipe(this.#all, action);
        } else {
            this.initNamedPipe(name);
            this.addToPipe(this.#named[name], action);
        }
        return this;
    }

    addToPipe(pipe, action) {
        if (!pipe.includes(action)) {
            pipe.push(action);
        }
    }

    removeFromPipe(pipe, action) {
        if (pipe.includes(action)) {
            pipe.splice(pipe.indexOf(action), 1);
        }
    }

    initNamedPipe(name) {
        if (!objHas(this.#named, name) || !Array.isArray(this.#named[name])) {
            this.#named[name] = [];
        }
    }

    remove(name, action) {
        if (typeof name === "undefined") {
            this.removeFromPipe(this.#all, action);
        } else {
            this.initNamedPipe(name);
            this.removeFromPipe(this.#named[name], action);
        }
        return this;
    }

    buildPipe(name) {
        const final = [...this.#all];
        this.initNamedPipe(name);
        final.push(...this.#named[name]);
        return final;
    }

    async execute(name, params) {
        try {
            const pipe = this.buildPipe(name);
            return await this.#execute(pipe, params);
        } catch (e) {
            throw new ActionExceptionPipeExecutionError({ cause: e });
        }
    }

    async #execute(pipe, params) {
        const ways = {
            [CONSECUTIVE]: this.executeConsecutive.bind(this),
            [PARALLEL]: this.executeParallel.bind(this),
        };
        return await ways[this.type](pipe, params);
    }

    async executeConsecutive(pipe, params) {
        for (let action of pipe) {
            await this.actionRunner.run(action, params);
        }
    }

    async executeParallel(pipe, params) {
        const promisesOfPipe = pipe.map((action) =>
            this.actionRunner.run(action, params)
        );
        await Promise.all(promisesOfPipe);
    }
}

module.exports = NamedActionPipes;

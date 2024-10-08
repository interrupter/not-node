const fs = require("fs");
const path = require("path");
const logger = require("not-log");

const { tryFile, mapBind } = require("../../common");
/**
 * List of methods to be binded from notApp to logics
 * @constant
 * @type {Array<string>}
 **/
const LOGIC_BINDINGS_LIST = [
    "getModel",
    "getModelFile",
    "getModelSchema",
    "getLogic",
    "getLogicFile",
    "getModule",
];

module.exports = class notModuleRegistratorLogics {
    static openFile = require;

    static run({ nModule }) {
        const srcDir = notModuleRegistratorLogics.getPath(nModule);
        if (!srcDir) {
            return false;
        }
        this.findAll({
            nModule,
            srcDir,
        });
        return true;
    }

    static getPath(nModule) {
        return nModule.module.paths.logics;
    }

    /**
     * Searching fields in directory
     * @static
     * @param {Object}     input
     * @param {import('../module')}  input.nModule
     * @param {string}     input.srcDir
     **/
    static findAll({ nModule, srcDir }) {
        fs.readdirSync(srcDir).forEach((file) => {
            let fromPath = path.join(srcDir, file);
            //log.info(`Checking logic in ${fromPath}`);
            if (!tryFile(fromPath)) {
                return;
            }
            this.register({ nModule, fromPath, file });
        });
    }

    static register({ nModule, fromPath, file }) {
        const logic = notModuleRegistratorLogics.openFile(fromPath);
        const logicName = notModuleRegistratorLogics.getName({ logic, file });
        this.extend({ nModule, logic, logicName, fromPath });
        nModule.setLogic(logicName, logic);
        //log.info(`${logicName}`);
    }

    static extend({ nModule, logic, logicName, fromPath }) {
        logic.filename = fromPath;
        if (nModule.appIsSet()) {
            mapBind(nModule.getApp(), logic, LOGIC_BINDINGS_LIST);
        }
        logic.log = logger(logic, `Logic#${logicName}`);
        logic.getThisModule = () => nModule;
    }

    static getName({ logic, file }) {
        let logicName = file;
        if (logic && logic.thisLogicName) {
            logicName = logic.thisLogicName;
        }
        return logicName;
    }
};

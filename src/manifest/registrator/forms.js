const path = require("path");
const fs = require("fs");
const { tryFile } = require("../../common");

module.exports = class notModuleRegistratorForms {
    static openFile = require;

    constructor({ nModule }) {
        this.run({ nModule });
    }

    run({ nModule }) {
        const srcDir = notModuleRegistratorForms.getPath(nModule);
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
        return nModule.module.paths.forms;
    }

    /**
     * Searching forms in directory
     * @param {Object}     input
     * @param {string}     input.srcDir
     * @param {import('../module')} input.nModule
     **/
    findAll({ nModule, srcDir }) {
        fs.readdirSync(srcDir).forEach((file) => {
            let fromPath = path.join(srcDir, file);
            if (!tryFile(fromPath)) {
                return;
            }
            this.register({ nModule, fromPath });
        });
    }

    register({ nModule, fromPath }) {
        const Form = notModuleRegistratorForms.openFile(fromPath);
        const parts = path.parse(fromPath);
        nModule.setFormConstructor(parts.name, Form);
    }
};

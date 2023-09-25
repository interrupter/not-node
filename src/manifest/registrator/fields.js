const path = require("path");
const fs = require("fs");
const { tryFile, objHas } = require("../../common");
const Fields = require("../../fields");
const { log } = require("not-log")(module, "register//fields");
module.exports = class notModuleRegistratorFields {
    static openFile = require;
    static fieldsManager = Fields;

    constructor({ nModule }) {
        this.run({ nModule });
    }

    run({ nModule }) {
        const srcDir = notModuleRegistratorFields.getPath(nModule);
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
        return nModule.module.paths.fields;
    }

    registerFields({ nModule, lib, fromPath }) {
        for (let t in lib) {
            this.registerField({
                nModule,
                name: t,
                field: lib[t],
                fromPath,
            });
        }
    }

    registerField({ nModule, name, field, fromPath }) {
        const fieldValidatorsCount = this.extendByFrontValidators({
            name,
            field,
            fromPath: path.dirname(fromPath),
        });
        nModule.setField(name, field);
        const MODULE_NAME = nModule.getName();
        log(`${MODULE_NAME}//${name} with ${fieldValidatorsCount} validators`);
    }

    findValidatorsFile(name, fromPath, possible_extensions = [".js", ".cjs"]) {
        for (let ext of possible_extensions) {
            const validatorName = path.join(fromPath, "validators", name + ext);
            if (tryFile(validatorName)) {
                return validatorName;
            }
        }
        return 0;
    }

    /**
     *
     **/
    extendByFrontValidators({ name, field, fromPath }) {
        if (!(field && objHas(field, "model"))) {
            return;
        }
        //load validators
        const validatorName = this.findValidatorsFile(name, fromPath);
        if (!validatorName) {
            return;
        }
        const validators = notModuleRegistratorFields.openFile(validatorName);
        //inject into field.model
        if (!objHas(field.model, "validate")) {
            field.model.validate = [];
        }
        field.model.validate.push(...validators);
        return validators.length;
    }

    /**
     * Searching fields in directory
     * @param {Object}     input
     * @param {import('../module')}  input.nModule
     * @param {string}     input.srcDir
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

    /**
     * Registering fields from specific path
     *
     * @param {Object}     input
     * @param {import('../module')}  input.nModule
     * @param {string}     input.fromPath
     */
    register({ nModule, fromPath }) {
        let file = notModuleRegistratorFields.openFile(fromPath);
        if (file && objHas(file, "FIELDS")) {
            //collection
            this.registerFields({
                nModule,
                lib: file.FIELDS, //fields dictionary
                fromPath,
            });
        } else {
            //single file fieldname.js
            const parts = path.parse(fromPath);
            this.registerField({
                nModule,
                name: parts.name, //fields name
                field: file, //field description
                fromPath,
            });
        }
    }
};

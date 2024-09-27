const path = require("path");
const fs = require("fs");
const { tryFile, objHas } = require("../../common");
const Fields = require("../../fields");
const { log } = require("not-log")(module, "register//fields");
const notAppPostponedFieldsRegistrator = require("./fields.postponed");

module.exports = class notModuleRegistratorFields {
    static openFile = require;
    static fieldsManager = Fields;

    static reopenCached(pathToModule) {
        delete this.openFile.cache[this.openFile.resolve(pathToModule)];
        return this.openFile(pathToModule);
    }

    static run({ nModule }) {
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

    static registerFields({ nModule, lib, fromPath }) {
        for (let t in lib) {
            this.registerField({
                nModule,
                name: t,
                field: lib[t],
                fromPath,
            });
        }
    }

    /**
     *
     *
     * @param {object}  param { nModule, name, field, fromPath }
     * @param {import('../module')}     param.nModule
     * @param {string}                  param.name
     * @param {object}                  param.field
     * @param {string}                  param.fromPath
     */
    static registerField({ nModule, name, field, fromPath }) {
        const MODULE_NAME = nModule.getName();
        if (
            notAppPostponedFieldsRegistrator.fieldShouldBePostponed(
                field,
                nModule
            )
        ) {
            notAppPostponedFieldsRegistrator.add(
                field.parent,
                MODULE_NAME,
                fromPath
            );
            return;
        } else if (field.parent) {
            const parentFieldValue =
                notAppPostponedFieldsRegistrator.findParentField(
                    field.parent,
                    nModule
                );
            if (parentFieldValue) {
                field = Fields.mutateField(parentFieldValue, field);
            }
        }
        const fieldValidatorsCount = this.extendByFrontValidators({
            name,
            field,
            fromPath: path.dirname(fromPath),
        });
        nModule.setField(name, field);
        log(
            `${MODULE_NAME}//${name} with ${fieldValidatorsCount ?? 0}/${
                field?.model?.validate?.length ?? 0
            } validators`
        );
        this.registerFieldIfInsecure(field, nModule, name);
        notAppPostponedFieldsRegistrator.registerPostponedChildren(
            nModule,
            this,
            MODULE_NAME,
            `${MODULE_NAME}//${name}`
        );
    }

    static registerFieldIfInsecure(field, nModule, name) {
        if (
            field.model &&
            (!field.model.validate || field.model.validate.length === 0)
        ) {
            notAppPostponedFieldsRegistrator.registerInsecureField(
                `${nModule.getName()}//${name}`
            );
        }
    }

    static findValidatorsFile(
        name,
        fromPath,
        possible_extensions = [".js", ".cjs", ".mjs"]
    ) {
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
    static extendByFrontValidators({ name, field, fromPath }) {
        if (!(field && objHas(field, "model"))) {
            return;
        }
        //load validators
        const validatorName = this.findValidatorsFile(name, fromPath);
        if (!validatorName) {
            return field?.model?.validate?.length;
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
    static findAll({ nModule, srcDir }) {
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
    static register({ nModule, fromPath }) {
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

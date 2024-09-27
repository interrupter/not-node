const path = require("path");
const getApp = require("../../getApp");
const { mutateField } = require("../../fields");
const { log } = require("not-log")(module, "register//fields.postponed");

/**
 * @typedef     {object}    WaitingField
 * @property    {string}    moduleName
 * @property    {string}    pathToField
 */

class notAppPostponedFieldsRegistrator {
    /**
     *
     * @static
     * @property {Object<strin, WaitingField>}
     * @memberof notModuleRegistratorFields
     */
    static #waitingList = {};
    static #insecureList = [];

    /**
     *
     *
     * @static
     * @param {string} parentFieldName  full path to field not-module-name//not-field-name
     * @param {string} moduleName       not-module-name
     * @param {string} pathToField      path to field file
     * @memberof notModuleRegistratorFields
     */
    static add(parentFieldName, moduleName, pathToField) {
        const parts = path.parse(pathToField);
        log(
            `field ${parentFieldName} not registered yet, field ${moduleName}//${parts.name} postponed`
        );
        if (!Object.hasOwn(this.#waitingList, parentFieldName)) {
            this.#waitingList[parentFieldName] = [];
        }
        this.#waitingList[parentFieldName].push({
            moduleName,
            pathToField,
        });
    }

    /**
     *
     *
     * @static
     * @param {string} parentFieldName  full path to field not-module-name//not-field-name
     * @return {Array<WaitingField>}
     * @memberof notModuleRegistratorFields
     */
    static getChildren(parentFieldName) {
        if (Object.hasOwn(this.#waitingList, parentFieldName)) {
            return this.#waitingList[parentFieldName];
        } else {
            return [];
        }
    }

    /**
     * Removes all records of waiting registration fields
     * @static
     * @param {string} parentFieldName          full path to field not-module-name//not-field-name
     * @memberof notAppPostponedFieldsRegistrator
     */
    static clearList(parentFieldName) {
        if (Object.hasOwn(this.#waitingList, parentFieldName)) {
            delete this.#waitingList[parentFieldName];
        }
    }

    static findParentField(fielName, nModule) {
        const [parentFieldModule, parentFieldName] = fielName.split("//");
        if (parentFieldModule === nModule.getName()) {
            return nModule.getField(parentFieldName);
        } else {
            return getApp().getField(fielName);
        }
    }

    /**
     * If parent fields exists in childField description and
     * parent field is not registered yet - returns true
     *
     * @static
     * @param {import('../../types').notField} childField
     * @return {boolean}
     * @memberof notAppPostponedFieldsRegistrator
     */
    static fieldShouldBePostponed(childField, nModule) {
        if (Object.hasOwn(childField, "parent")) {
            if (
                childField.parent &&
                typeof childField.parent === "string" &&
                childField.parent.length > 4 &&
                childField.parent.indexOf("//") > 0
            ) {
                const parentField = this.findParentField(
                    childField.parent,
                    nModule
                );
                if (!parentField) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     *  Returns lib of parent fields and depending fields paths that wasnt resolved
     *
     * @static
     * @return {Object<[string], Array<string>>}
     * @memberof notAppPostponedFieldsRegistrator
     */
    static state() {
        return {
            unresolved: this.getStateUnresolved(),
            insecure: this.getStateInsecure(),
        };
    }

    static getStateUnresolved() {
        const result = {};
        Object.keys(this.#waitingList).forEach((parentField) => {
            result[parentField] = this.#waitingList[parentField].map(
                (itm) => itm.pathToField
            );
        });
        return result;
    }

    static getStateInsecure() {
        return this.#insecureList;
    }

    static registerInsecureField(fullFieldName) {
        this.#insecureList.push(fullFieldName);
    }

    /**
     *
     *
     * @static
     * @param {import('./fields')} registrator
     * @param {string} MODULE_NAME
     * @param {string} fullFieldName
     * @memberof notAppPostponedFieldsRegistrator
     */
    static registerPostponedChildren(
        nModuleNotRegistred,
        registrator,
        MODULE_NAME,
        fullFieldName
    ) {
        const list = this.getChildren(fullFieldName);

        if (list.length) {
            const nModule =
                (getApp && getApp().getModule(MODULE_NAME)) ||
                nModuleNotRegistred;
            log(
                `running registration of fields (${list.length}) derived from ${fullFieldName}`
            );
            list.forEach((childField) => {
                const fieldFile = registrator.reopenCached(
                    childField.pathToField
                );
                const resultedField = this.mutateOriginal(
                    fullFieldName,
                    nModule,
                    fieldFile
                );
                const parts = path.parse(childField.pathToField);
                registrator.registerField({
                    nModule,
                    name: parts.name, //fields name
                    field: resultedField, //field description
                    fromPath: childField.pathToField,
                });
            });
        }
        this.clearList(fullFieldName);
    }

    static mutateOriginal(fullFieldName, nModule, mutator) {
        const parentField = this.findParentField(fullFieldName, nModule);
        return mutateField(parentField, mutator);
    }
}

module.exports = notAppPostponedFieldsRegistrator;

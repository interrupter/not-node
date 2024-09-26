const path = require("path");
const getApp = require("../../getApp");

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

    /**
     * If parent fields exists in childField description and
     * parent field is not registered yet - returns true
     *
     * @static
     * @param {import('../../types').notField} childField
     * @return {boolean}
     * @memberof notAppPostponedFieldsRegistrator
     */
    static fieldShouldBePostponed(childField) {
        if (Object.hasOwn(childField, "parent")) {
            if (
                childField.parent &&
                typeof childField.parent === "string" &&
                childField.parent.length > 4 &&
                childField.parent.indexOf("//") > 0
            ) {
                const parentField = getApp().getField(childField.parent);
                return !parentField;
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
        const result = {};
        Object.keys(this.#waitingList).forEach((parentField) => {
            result[parentField] = this.#waitingList.map(
                (itm) => itm.pathToField
            );
        });
        return result;
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
    static registerPostponedChildren(registrator, MODULE_NAME, fullFieldName) {
        const list = this.getChildren(fullFieldName);
        list.forEach((childField) => {
            const nModule = getApp().getModule(MODULE_NAME);
            const fieldFile = registrator.reopenCached(childField.pathToField);
            const parts = path.parse(childField.pathToField);
            registrator.registerField({
                nModule,
                name: parts.name, //fields name
                field: fieldFile, //field description
                fromPath: childField.pathToField,
            });
        });
        this.clearList(fullFieldName);
    }
}

module.exports = notAppPostponedFieldsRegistrator;

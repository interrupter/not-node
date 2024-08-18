const {
    isFunc,
    firstLetterToLower,
    objHas,
    isNotEmptyString,
} = require("../common");
const { getSafeFieldsForRoleAction } = require("../auth/fields");
const { DEFAULT_USER_ROLE_FOR_GUEST } = require("../auth/const");
/**
 * notFieldsFilter.filter(fields, getApp().getModelSchema(MODEL_NAME), {action});
 *
 *  usage:
 * manifest = {
 *      ...
 *      actions:{
 *          ...
 *          list:{
 *              rules:[{
 *                  root: true,
 *                  fields: notFieldsFilter.filter(['@*'], getApp().getModelSchema(MODEL_NAME), {action:read});
 *              }]
 *          },
 *          profile:{
 *              method: 'get',
 *              rules:[{
 *                      auth: true
 *                      fields: []
 *                  },{
 *                      root: true
 *              }]
 *          },
 *      }
 *      ...
 * }
 */

const OPERATOR_EXCLUDE = "-";
const SPECIAL_SET_PREFIX = "@";

//system special fields sets aka system specials
const SPECIAL_SET_ALL = "*";
const SPECIAL_SET_SAFE = "safe";
const SPECIAL_SET_UNSAFE = "unsafe";
const SPECIAL_SET_TIMESTAMPS = "timestamps";
const SPECIAL_SET_OWNAGE = "ownage";
const SPECIAL_SET_VERSIONING = "versioning";
const SPECIAL_SET_ID_NUMERIC = "ID";
const SPECIAL_SET_ID_UUID = "id";

/**
 * @typedef     {Object}    FieldsFilteringModificators
 * @property    {string}    [action]    read, update
 * @property    {string}    [modelName] name of the schema model
 * @property    {Array<string>} [roles] roles set
 * @property    {boolean}   [owner]     owner initiated action
 * @property    {boolean}   [system]    system initiated action
 * @property    {boolean}   [root]      root initiated action
 * @property    {boolean}   [auth]      authenticated user initiated action
 */

class notFieldsFilter {
    static #USER_DEFINED_SETS = {};

    static get userSets() {
        //eslint-disable-next-line no-undef
        return structuredClone(this.#USER_DEFINED_SETS);
    }

    static addSet(name, fields) {
        if (
            !Object.values(this.specials).includes(name) &&
            fields.every(isNotEmptyString)
        ) {
            this.#USER_DEFINED_SETS[name] = fields;
            return true;
        }
        return false;
    }

    static removeSet(name) {
        if (objHas(this.#USER_DEFINED_SETS, name)) {
            delete this.#USER_DEFINED_SETS[name];
            return true;
        }
        return false;
    }

    static get specials() {
        return {
            ALL: SPECIAL_SET_ALL,
            SAFE: SPECIAL_SET_SAFE,
            UNSAFE: SPECIAL_SET_UNSAFE,
            TIMESTAMPS: SPECIAL_SET_TIMESTAMPS,
            OWNAGE: SPECIAL_SET_OWNAGE,
            VERSIONING: SPECIAL_SET_VERSIONING,
            ID_NUMERIC: SPECIAL_SET_ID_NUMERIC,
            ID_UUID: SPECIAL_SET_ID_UUID,
        };
    }

    static get specialSets() {
        return {
            ...this.#USER_DEFINED_SETS,
            [SPECIAL_SET_ALL]: (schema) => {
                return [
                    `${SPECIAL_SET_PREFIX}${SPECIAL_SET_ID_UUID}`,
                    `${SPECIAL_SET_PREFIX}${SPECIAL_SET_ID_NUMERIC}`,
                    ...Object.keys(schema),
                ];
            },
            [SPECIAL_SET_SAFE]: (
                schema,
                {
                    action = "",
                    roles = [DEFAULT_USER_ROLE_FOR_GUEST],
                    owner = false,
                    system = false,
                }
            ) => {
                return getSafeFieldsForRoleAction(
                    schema,
                    action,
                    roles,
                    owner,
                    system
                );
            },
            [SPECIAL_SET_UNSAFE]: ["salt", "password"],
            [SPECIAL_SET_TIMESTAMPS]: ["createdAt", "updatedAt"],
            [SPECIAL_SET_OWNAGE]: ["owner", "ownerId", "ownerModel"],
            [SPECIAL_SET_VERSIONING]: [
                "__version",
                "__versions",
                "__closed",
                "__latest",
                "__v",
            ],
            [SPECIAL_SET_ID_NUMERIC]: (schema, { modelName }) => {
                return [`${firstLetterToLower(modelName)}ID`];
            },
            [SPECIAL_SET_ID_UUID]: ["_id"],
        };
    }

    static getSpecialSetContent(setName, schema, mods) {
        const setGenerator = this.specialSets[setName];
        if (isFunc(setGenerator)) {
            return [...setGenerator(schema, mods)];
        } else {
            return [...setGenerator];
        }
    }

    static DEFAULT_SET = [`${SPECIAL_SET_PREFIX}${SPECIAL_SET_ALL}`];

    /**
     *
     *
     * @static
     * @param {Array<string>} fieldsSet
     * @return {boolean}
     * @memberof notFieldsFilter
     */
    static isContainingSpecialSets(fieldsSet) {
        return this.getFirstSpecialSetIndex(fieldsSet) > -1;
    }

    static isExcludeOperation(fieldItem) {
        return fieldItem.indexOf(OPERATOR_EXCLUDE) === 0;
    }

    static getFirstExcludeOperationIndex(fieldsSet) {
        return fieldsSet.findIndex((item) => this.isExcludeOperation(item));
    }

    static isContainingExcludeOperation(fieldsSet) {
        return this.getFirstExcludeOperationIndex(fieldsSet) > -1;
    }

    /**
     *
     *
     * @static
     * @param {Array<string>} fieldsSet
     * @return {number}
     * @memberof notFieldsFilter
     */
    static getFirstSpecialSetIndex(fieldsSet) {
        return fieldsSet.findIndex((item) => this.isSpecialSet(item));
    }

    static isSpecialSet(name) {
        // @something or -@something
        return (
            name.indexOf(SPECIAL_SET_PREFIX) === 0 ||
            (name.indexOf(SPECIAL_SET_PREFIX) === 1 &&
                name.indexOf(OPERATOR_EXCLUDE) === 0)
        );
    }

    /**
     *
     *
     * @static
     * @param {string} name
     * @return {string}
     * @memberof notFieldsFilter
     */
    static getSpecialSetNameFromFieldsSetItem(name) {
        return name.substring(name.indexOf(SPECIAL_SET_PREFIX) + 1);
    }

    static fieldsListIsNotPlain(fieldsList) {
        return (
            this.isContainingSpecialSets(fieldsList) ||
            this.isContainingExcludeOperation(fieldsList)
        );
    }

    static applyExcludeOperationToFieldItem(fieldItem) {
        if (this.isExcludeOperation(fieldItem)) {
            return this.unmarkFieldToExlude(fieldItem);
        } else {
            return this.markFieldToExlude(fieldItem);
        }
    }

    static applyExludeOperationToFieldsItems(fields) {
        return fields.map((item) =>
            this.applyExcludeOperationToFieldItem(item)
        );
    }

    /**
     * input field item marked to be included
     *  output field item marked to be exluded
     * @static
     * @param {string} field    field
     * @return {string}         -field
     * @memberof notFieldsFilter
     */
    static markFieldToExlude(field) {
        return `${OPERATOR_EXCLUDE}${field}`;
    }

    /**
     * input field item marked to be exluded
     * output field item marked to be included
     * @static
     * @param {string} field    -field
     * @return {string}         field
     * @memberof notFieldsFilter
     */
    static unmarkFieldToExlude(field) {
        return field.substring(1);
    }

    /**
     * translates fields items with specials to plain fields names
     *
     * @static
     * @param {Array<string>} fields
     * @param {import('mongoose').SchemaDefinition} schema
     * @param {FieldsFilteringModificators} [mods]
     * @return {Array<string>}
     * @memberof notFieldsFilter
     */
    static specialsToPlain(fields, schema, mods) {
        while (this.isContainingSpecialSets(fields)) {
            const index = this.getFirstSpecialSetIndex(fields);
            const specialSetItem = fields[index];
            const specialSetName =
                this.getSpecialSetNameFromFieldsSetItem(specialSetItem);
            const exclude = this.isExcludeOperation(specialSetItem);
            const fieldsToInsert = this.getSpecialSetContent(
                specialSetName,
                schema,
                mods
            );
            const operationAppliedFieldsList = exclude
                ? this.applyExludeOperationToFieldsItems(fieldsToInsert)
                : fieldsToInsert;
            fields.splice(index, 1, ...operationAppliedFieldsList);
        }
        return fields;
    }

    static removeExcludedFields(fields) {
        const result = [...fields];
        while (this.isContainingExcludeOperation(result)) {
            let index = this.getFirstExcludeOperationIndex(result);
            const fieldNameToExclude = this.unmarkFieldToExlude(result[index]);
            result.splice(index, 1);
            while (
                result.indexOf(fieldNameToExclude) > -1 &&
                result.indexOf(fieldNameToExclude) < index
            ) {
                result.splice(result.indexOf(fieldNameToExclude), 1);
                index--;
            }
        }
        return result;
    }

    static clearFromDuplicated(fields) {
        return [...new Set(fields)];
    }

    /**
     * Creates plain fields list from fields list with fields, synonyms, fields sets
     * and exlude operations
     * schema = {name, description, country, __versions, __version, __closed, __latest, __v}
     * ['*','-@versioning'] -> [_id, name, description, country]
     * exlude X exlude -> include
     * some @fieldsSet = ['-name', 'country']
     * ['-@fieldsSet'] -> ['name', '-country']
     * @static
     * @param {Array<string>} fieldsSet
     * @param {import('mongoose').SchemaDefinition} schema
     * @param {FieldsFilteringModificators} mods
     * @return {Array<string>}
     * @memberof notFieldsFilter
     */
    static filter(fieldsSet, schema = {}, mods = { action: undefined }) {
        const fields = [...fieldsSet];
        this.specialsToPlain(fields, schema, mods);
        return this.clearFromDuplicated(this.removeExcludedFields(fields));
    }
}

module.exports = notFieldsFilter;

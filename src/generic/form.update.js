const Form = require("../form/form");
const { getGenericDataField } = require("./field");
/**
 * Creates generic crUd form, if data field is not defined in fields/ it creates and registers field in module and sub _data form
 *
 * @param {Object}              param
 * @param {string}              param.MODULE_NAME
 * @param {string}              param.MODEL_NAME
 * @param {string}              [param.actionName="update"]
 * @param {string}              [param.dataFieldName = "_data"]
 * @param {Array<function>}     [param.validators = []]
 * @param {Array<function>}     [param.dataValidators = []],
 * @param {function}            [param.afterExtract = async (input , req) => input]
 * @param {function}            [param.afterDataExtract = async (input,  req) => input]
 */
function genericUpdateForm({
    MODULE_NAME,
    MODEL_NAME,
    actionName = "update",
    dataFieldName = "_data",
    validators = [],
    dataValidators = [],
    afterExtract = async (input /*, req*/) => input,
    afterDataExtract = async (input /*, req*/) => input,
}) {
    const defaultDataFieldPath = Form.createPath(
        MODULE_NAME,
        MODEL_NAME,
        dataFieldName
    );

    const dataFieldDefinition = getGenericDataField({
        fieldPath: defaultDataFieldPath,
        MODULE_NAME,
        MODEL_NAME,
        validators: dataValidators,
        afterExtract: afterDataExtract,
    });

    const FIELDS = [
        ["targetId", { required: true }, "not-node//objectId"],
        ["identity", "not-node//identity"],
        ["data", dataFieldDefinition],
    ];

    return class extends Form {
        constructor({ app }) {
            super({ FIELDS, app, MODULE_NAME, MODEL_NAME, actionName });
        }

        async afterExtract(input, req) {
            input = await super.afterExtract(input, req);
            return await afterExtract(input, req);
        }

        getFormValidationRules() {
            return validators;
        }
    };
}

module.exports = genericUpdateForm;

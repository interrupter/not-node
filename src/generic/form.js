const Common = require("../common.js");
const Form = require("../form/form.js");

/**
 *
 * @param   {object} options
 * @param   {import('../app.js')}   options.app
 * @param   {string}   options.MODULE_NAME
 * @param   {string}   options.MODEL_NAME
 * @param   {string}   options.actionName
 * @returns {object}    instance of Form
 */
function createDefaultInstance({
    app,
    MODULE_NAME,
    MODEL_NAME,
    actionName,
    config,
    /* validators = [],
    dataValidators = [],*/
}) {
    const FIELDS = [
        ["identity", "not-node//identity"],
        ["data", `${MODULE_NAME}//_${Common.firstLetterToLower(MODEL_NAME)}`],
    ];
    const FORM_NAME = Form.createName(MODULE_NAME, MODEL_NAME, actionName);
    return new Form({ FIELDS, FORM_NAME, app, MODULE_NAME, config });
}

module.exports = createDefaultInstance;

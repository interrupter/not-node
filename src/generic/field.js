const getApp = require("../getApp");
const genericDataField = require("./field._data");
const Form = require("../form/form");

const initGenericDataField = (
    MODULE_NAME,
    MODEL_NAME,
    actionName = "_data",
    validators = [],
    afterExtract = async (input /*, req = null*/) => input
) => {
    //not-module//modelName._data
    const fieldGenericPath = Form.createPath(
        MODULE_NAME,
        MODEL_NAME,
        actionName
    );
    //modelName._data
    const fieldGenericName = fieldGenericPath.split("//")[1];
    const App = getApp();
    //if already exists - returning full path to it
    if (App.getModule(MODULE_NAME).getField(fieldGenericName)) {
        return fieldGenericPath;
    }
    //create new definition, register, return
    return genericDataField({
        MODULE_NAME,
        MODEL_NAME,
        FORM_PATH: fieldGenericPath,
        validators,
        afterExtract,
    });
};

const getGenericDataField = ({
    fieldPath,
    MODULE_NAME,
    MODEL_NAME,
    validators,
    afterExtract,
}) => {
    if (getApp().getField(fieldPath)) {
        return fieldPath;
    } else {
        return initGenericDataField({
            MODULE_NAME,
            MODEL_NAME,
            validators,
            afterExtract,
        });
    }
};

module.exports = { getGenericDataField, initGenericDataField };

const Schema = require("mongoose").Schema;
const getApp = require("../getApp");
const { firstLetterToLower } = require("../common");
const genericDataForm = require("./forms/form._data");
const Form = require("../form/form");

const initGenericDataForm = ({
    MODULE_NAME,
    MODEL_NAME,
    actionName,
    formName,
    validators = [],
    afterExtract = async (input /*, req = null*/) => input,
}) => {
    try {
        const cls = genericDataForm({
            MODULE_NAME,
            MODEL_NAME,
            actionName,
            validators,
            afterExtract,
        });
        const App = getApp();
        App.getModule(MODULE_NAME).setFormConstructor(formName, cls);
        App.getModule(MODULE_NAME).setForm(formName, new cls(App));
        return true;
    } catch (e) {
        getApp().logger.error(e);
        return false;
    }
};

module.exports = ({
    MODULE_NAME,
    MODEL_NAME,
    actionName = "_data",
    FORM_PATH,
    validators = [],
    afterExtract = async (input /*, req = null*/) => input,
}) => {
    if (!FORM_PATH) {
        FORM_PATH = Form.createPath(MODULE_NAME, MODEL_NAME, actionName);
    }
    const formName = FORM_PATH.split("//")[1];
    if (!getApp().getModule(MODULE_NAME).getFormConstructor(formName)) {
        initGenericDataForm({
            MODULE_NAME,
            MODEL_NAME,
            actionName,
            formName,
            validators,
            afterExtract,
        });
    }
    return {
        model: {
            type: Schema.Types.Mixed,
            required: true,
            validate: [
                {
                    validator(val) {
                        return getApp().getForm(FORM_PATH).run(val);
                    },
                    message: `${MODULE_NAME}:${firstLetterToLower(
                        MODEL_NAME
                    )}_data_is_not_valid`,
                },
            ],
        },
    };
};

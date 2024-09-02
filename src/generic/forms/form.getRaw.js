const genericGetByIdForm = require("./form.getById");

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName = "getRaw" }) => {
    return genericGetByIdForm({
        MODULE_NAME,
        MODEL_NAME,
        actionName,
    });
};

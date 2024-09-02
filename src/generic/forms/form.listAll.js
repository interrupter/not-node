const genericAuthorizedActionForm = require("./form.authorizedAction");

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName = "listAll" }) => {
    return genericAuthorizedActionForm({
        MODULE_NAME,
        MODEL_NAME,
        actionName,
    });
};

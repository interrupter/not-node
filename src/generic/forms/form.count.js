const genericListForm = require("./form.list");

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName = "count" }) => {
    return genericListForm({
        MODULE_NAME,
        MODEL_NAME,
        actionName,
    });
};

//DB related validation tools
const Form = require("../../form/form");

//form
const FIELDS = [
    ["targetId", { required: true }, "not-node//objectId"],
    ["identity", "not-node//identity"],
];

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName = "getById" }) => {
    return class extends Form {
        constructor(params) {
            super({ ...params, MODULE_NAME, MODEL_NAME, actionName, FIELDS });
        }
    };
};

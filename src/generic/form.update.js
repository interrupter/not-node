const Form = require("../form/form");

module.exports = ({
    MODULE_NAME,
    MODEL_NAME,
    actionName = "update",
    dataFieldName = "data",
    validators = [],
    afterExtract = async (input /*, req*/) => input,
}) => {
    const FIELDS = [
        ["targetId", { required: true }, "not-node//objectId"],
        ["identity", "not-node//identity"],
        ["data", `${MODULE_NAME}//_${dataFieldName}`],
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
};

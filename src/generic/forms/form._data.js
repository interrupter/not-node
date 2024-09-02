const Form = require("../../form/form");

module.exports = ({
    MODULE_NAME,
    MODEL_NAME,
    actionName = "_data",
    validators = [],
    afterExtract = async (input /*, req = null*/) => input,
}) => {
    return class extends Form {
        constructor({ app }) {
            super({ app, MODULE_NAME, MODEL_NAME, actionName });
        }

        extract(data) {
            return data;
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

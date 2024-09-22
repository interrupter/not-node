const Form = require("../../form/form");

/**
 *
 * @param {object} param0
 * @param {string} param0.MODULE_NAME
 * @param {string} param0.MODEL_NAME
 * @param {string} param0.actionName
 * @param {Array<function>} param0.validators
 * @param {function} param0.afterExtract
 * @returns
 */
module.exports = ({
    MODULE_NAME,
    MODEL_NAME,
    actionName = "_data",
    validators = [],
    afterExtract = async (input, req = null) => input || req,
}) => {
    return class extends Form {
        /**
         *
         * @param {object} param0
         * @param {import('../../app')} param0.app
         */
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

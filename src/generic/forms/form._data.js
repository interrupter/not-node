const Form = require("../../form/form");

/**
 *
 * @param {object} param0
 * @param {string} param0.MODULE_NAME
 * @param {string} param0.MODEL_NAME
 * @param {string} [param0.actionName = '_data']
 * @param {Array<function>} [param0.validators=[]]
 * @param {function} [param0.afterExtract = async (input, req = null) => input || req]
 * @param {import('../../types.js').notAppConfigReader} [param0.config]
 * @param {Object.<string, Function>} [param0.EXTRACTORS]
 * @param {Object.<string, Function>} [param0.TRANSFORMERS]
 * @param {import('../../types.js').notAppFormProcessingPipe} [param0.INSTRUCTIONS]
 * @param {Array<Function>} [param0.AFTER_EXTRACT_TRANSFORMERS]
 * @param {Object.<string, import('../../types.js').notAppFormEnvExtractor>} [param0.ENV_EXTRACTORS]
 * @param   {import('../../types.js').notAppFormRateLimiterOptions}    [param0.rate]
 * @returns
 */
module.exports = ({
    MODULE_NAME,
    MODEL_NAME,
    actionName = "_data",
    validators = [],
    afterExtract = async (input, req = null) => input || req,
    EXTRACTORS = {},
    ENV_EXTRACTORS = {},
    TRANSFORMERS = {},
    INSTRUCTIONS = undefined,
    AFTER_EXTRACT_TRANSFORMERS = [],
    rate = undefined,
}) => {
    return class extends Form {
        /**
         *
         * @param {object} param0
         * @param {import('../../app')} param0.app
         * @param {import('../../types.js').notAppConfigReader} param0.config
         */
        constructor({ app, config }) {
            super({
                app,
                config,
                MODULE_NAME,
                MODEL_NAME,
                actionName,
                EXTRACTORS,
                ENV_EXTRACTORS,
                TRANSFORMERS,
                INSTRUCTIONS,
                AFTER_EXTRACT_TRANSFORMERS,
                rate,
            });
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

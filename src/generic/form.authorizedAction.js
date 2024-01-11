//DB related validation tools
const Form = require("../form/form");

//form
const STANDART_FIELDS = [["identity", "not-node//identity"]];

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName, FIELDS = [] }) => {
    const FORM_NAME = Form.createName(MODULE_NAME, MODEL_NAME, actionName);
    return class extends Form {
        constructor(params) {
            super({
                ...params,
                MODULE_NAME,
                MODEL_NAME,
                FIELDS: [...STANDART_FIELDS, ...FIELDS],
                FORM_NAME,
            });
        }

        async extract(req) {
            return this.afterExtract(
                {
                    ...this.extractRequestEnvs(req),
                },
                req
            );
        }
    };
};

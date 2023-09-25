const Form = require("./form");

module.exports = class FormFabric {
    static create({ FIELDS, MODULE_NAME, FORM_NAME, extractor }) {
        return class extends Form {
            constructor() {
                super({
                    FIELDS,
                    FORM_NAME: `${MODULE_NAME}:${FORM_NAME}`,
                });
            }

            /**
             * Extracts data
             * @param {import('../types').notNodeExpressRequest} req expressjs request object
             * @return {Promise<Object>}        forma data
             **/
            async extract(req) {
                return extractor(req);
            }
        };
    }
};

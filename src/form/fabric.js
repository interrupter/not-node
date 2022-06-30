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
             * @param {ExpressRequest} req expressjs request object
             * @return {Object}        forma data
             **/
            extract(req) {
                return extractor(req);
            }
        };
    }
};

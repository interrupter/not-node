//DB related validation tools
const Form = require("../form/form");
const { firstLetterToUpper } = require("../common");
//form
const FIELDS = [
    ["activeUserId", { required: true }, "not-node//objectId"],
    ["activeUser", "not-node//requiredObject"],
    ["ip", "not-node//ip"],
];

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName }) => {
    const FORM_NAME = `${MODULE_NAME}:${MODEL_NAME}:${firstLetterToUpper(
        actionName
    )}Form`;
    return class extends Form {
        constructor({ app }) {
            super({ FIELDS, FORM_NAME, app });
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

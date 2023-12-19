//DB related validation tools
const Form = require("../form/form");

//form
const FIELDS = [
    ["targetID", { required: true }, "not-node//ID"],

    ["identity", "not-node//requiredObject"],
];

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName = "getByID" }) => {
    const FORM_NAME = Form.createName(MODULE_NAME, MODEL_NAME, actionName);
    return class extends Form {
        constructor(params) {
            super({ ...params, MODULE_NAME, MODEL_NAME, FIELDS, FORM_NAME });
        }

        async extract(req) {
            const envs = this.extractRequestEnvs(req);
            return this.afterExtract(
                {
                    ...envs,
                    targetId: envs.modelNameID,
                },
                req
            );
        }
    };
};

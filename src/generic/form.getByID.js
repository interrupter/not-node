//DB related validation tools
const Form = require("../form/form");

//form
const FIELDS = [
    ["targetID", { required: true }, "not-node//ID"],
    ["identity", "not-node//identity"],
];

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName = "getByID" }) => {
    return class extends Form {
        constructor(params) {
            super({ ...params, MODULE_NAME, MODEL_NAME,actionName, FIELDS });
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

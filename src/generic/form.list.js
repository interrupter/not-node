const Form = require("../form/form");

const notFilter = require("not-filter");
const notAppIdentity = require("../identity");

const FIELDS = [
    ["query", `not-filter//_filterQuery`],
    ["identity", "not-node//identity"],
];

/**
 * Generates generic form to get perform list action
 *
 * @param {object}  params
 * @param {string}  params.MODULE_NAME  //module name
 * @param {string}  params.MODEL_NAME   //model name
 * @param {string}  params.actionName   //action name
 * @return {Form}   form class definition
 */
const FactoryFormList = ({ MODULE_NAME, MODEL_NAME, actionName = "list" }) => {
    const FORM_NAME = Form.createName(MODULE_NAME, MODEL_NAME, actionName);

    return class extends Form {
        constructor(params) {
            super({
                ...params,
                FIELDS,
                FORM_NAME,
                MODULE_NAME,
                MODEL_NAME,
            });
        }

        /**
         *
         *
         * @param {import('../types').notNodeExpressRequest} req
         * @return {Promise<import('../types').PreparedData>}
         */
        async extract(req) {
            const envs = this.extractRequestEnvs(req);
            const user = notAppIdentity.extractAuthData(req);
            if (user.auth && !user.root && !user.admin) {
                envs.query.filter = notFilter.filter.modifyRules(
                    envs.query.filter,
                    {
                        owner: user.uid,
                    }
                );
            }

            return this.afterExtract(
                {
                    ...envs,
                },
                req
            );
        }
    };
};

module.exports = FactoryFormList;

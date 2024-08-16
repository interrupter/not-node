const Form = require("../form/form");

const notFilter = require("not-filter");
const notAppIdentity = require("../identity");

const FIELDS = [
    ["query", `not-filter//_filterQuery`],
    ["identity", "not-node//identity"],
];

/**
 * Generates generic form to get perform list and count action
 *
 * @param {object}  params
 * @param {string}  params.MODULE_NAME  //module name
 * @param {string}  params.MODEL_NAME   //model name
 * @param {string}  params.actionName   //action name
 * @return {Form}   form class definition
 */
const FactoryFormListAndCount = ({
    MODULE_NAME,
    MODEL_NAME,
    actionName = "listAndCount",
}) => {


    return class extends Form {
        constructor(params) {
            super({
                ...params,
                FIELDS,
                MODULE_NAME,
                MODEL_NAME,
                actionName
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

module.exports = FactoryFormListAndCount;

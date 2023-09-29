const Form = require("../form/form");
const { firstLetterToUpper } = require("../common");
const notFilter = require("not-filter");

const FIELDS = [
    ["query", `not-filter//_filterQuery`],
    ["activeUserId", { required: true }, "not-node//objectId"],
    ["activeUser", "not-node//requiredObject"],
    ["ip", "not-node//ip"],
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
const FactoryFormListAndCount = ({ MODULE_NAME, MODEL_NAME, actionName }) => {
    const FORM_NAME = `${MODULE_NAME}:${MODEL_NAME}:${firstLetterToUpper(
        actionName
    )}Form`;

    return class extends Form {
        constructor({ app }) {
            super({ FIELDS, FORM_NAME, app });
        }

        /**
         *
         *
         * @param {import('../types').notNodeExpressRequest} req
         * @return {Promise<import('../types').PreparedData>}
         */
        async extract(req) {
            const envs = this.extractRequestEnvs(req);
            if (!req.user.isRoot() && !req.user.isAdmin()) {
                envs.query.filter = notFilter.filter.modifyRules(
                    envs.query.filter,
                    {
                        owner: req.user._id,
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

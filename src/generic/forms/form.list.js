const Form = require("../../form/form");
const {
    DOCUMENT_OWNER_FIELD_NAME,
    DOCUMENT_SESSION_FIELD_NAME,
} = require("../../auth/const");
const notFilter = require("not-filter");
const FormExceptions = require("../../exceptions/form");
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
    return class extends Form {
        constructor(params) {
            super({
                ...params,
                FIELDS,
                actionName,
                MODULE_NAME,
                MODEL_NAME,
            });
        }

        /**
         * Adds owner id or session to query.filter
         * @param {import('../../types').PreparedData}  prepared
         * @param {import('../../types').notNodeExpressRequest} req
         * @return {Promise<import('../../types').PreparedData>}
         */
        async afterExtract(prepared, req) {
            prepared = await super.afterExtract(prepared, req);
            if (!prepared.identity || !prepared.query) {
                throw new FormExceptions.FormExceptionIdentityOrQueryIsUndefined(
                    this.FORM_NAME
                );
            }
            if (!prepared.query.filter) {
                prepared.query.filter = notFilter.filter.createANDFilter();
            }
            if (
                prepared.identity.auth &&
                !prepared.identity.root &&
                !prepared.identity.admin
            ) {
                prepared.query.filter = notFilter.filter.modifyRules(
                    prepared.query.filter,
                    {
                        [DOCUMENT_OWNER_FIELD_NAME]: prepared.identity.uid,
                    }
                );
            } else if (!prepared.identity.auth && prepared.identity.sid) {
                prepared.query.filter = notFilter.filter.modifyRules(
                    prepared.query.filter,
                    {
                        [DOCUMENT_SESSION_FIELD_NAME]: prepared.identity.sid,
                    }
                );
            }
            return prepared;
        }
    };
};

module.exports = FactoryFormList;

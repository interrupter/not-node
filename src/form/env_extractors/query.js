const notFilter = require("not-filter");
const getApp = require("../../getApp");
const ACTION_DATA_TYPES = require("../../manifest/const").ACTION_DATA_TYPES;

const extractors = Object.freeze({
    [ACTION_DATA_TYPES.PAGER]: (result, req) => {
        const pager = notFilter.pager.process(req);
        if (pager) {
            result.skip = pager.skip;
            result.size = pager.size;
        }
    },
    [ACTION_DATA_TYPES.SORTER]: (result, req, thisSchema) => {
        result.sorter = notFilter.sorter.process(req, thisSchema);
    },
    [ACTION_DATA_TYPES.SEARCH]: (result, req, thisSchema, formOptions) => {
        result.search = notFilter.search.process(
            req,
            thisSchema,
            {},
            formOptions
        );
    },
    [ACTION_DATA_TYPES.FILTER]: (result, req, thisSchema) => {
        result.filter = notFilter.filter.process(req, thisSchema);
    },
    [ACTION_DATA_TYPES.RETURN]: (result, req, thisSchema) => {
        result.return = notFilter.return.process(req, thisSchema);
    },
});

/**
 *
 * @param {import('../form')}                           form
 * @param {import('../../types').notNodeExpressRequest} req
 * @returns
 */
module.exports = (form, req) => {
    const MODULE_NAME = form.getModuleName();
    const MODEL_NAME = form.getModelName(req);
    let thisSchema;
    if (MODEL_NAME && MODULE_NAME) {
        thisSchema = getApp().getModelSchema(`${MODULE_NAME}//${MODEL_NAME}`);
    } else {
        getApp().log(
            `warning: Form '${form.FORM_NAME}' for model '${MODEL_NAME}' has no MODULE_NAME`
        );
        thisSchema = getApp().getModelSchema(`${MODEL_NAME}`);
    }
    if (thisSchema) {
        let result = {};
        const formOptions = form.getExtractorsOptions();
        const routeActionDataTypes = form.getActionDataDataTypes(req);
        Object.values(ACTION_DATA_TYPES).forEach((dataType) => {
            if (
                routeActionDataTypes.includes(dataType) &&
                Object.hasOwn(extractors, dataType)
            ) {
                extractors[dataType](result, req, thisSchema, formOptions);
            }
        });

        return {
            name: "query",
            value: result, //{ skip, size, sorter, search, filter, return }
        };
    }

    return undefined;
};

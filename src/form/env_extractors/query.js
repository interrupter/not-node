const notFilter = require("not-filter");
const getApp = require("../../getApp");

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
        let skip, size;
        const pager = notFilter.pager.process(req), //skip,size
            sorter = notFilter.sorter.process(req, thisSchema),
            search = notFilter.search.process(req, thisSchema);
        let filter = notFilter.filter.process(req, thisSchema);
        if (pager) {
            skip = pager.skip;
            size = pager.size;
        }
        return {
            name: "query",
            value: { skip, size, sorter, search, filter },
        };
    }

    return undefined;
};

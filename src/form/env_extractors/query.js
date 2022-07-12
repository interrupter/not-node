const notFilter = require("not-filter");
const getApp = require("../../getApp");

module.exports = (form, req) => {
    const MODULE_NAME = form.getModuleName();
    const MODEL_NAME = form.getModelName(req);
    if (MODEL_NAME && MODULE_NAME) {
        const thisSchema = getApp().getModelSchema(
            `${MODULE_NAME}//${MODEL_NAME}`
        );
        if (thisSchema) {
            const { skip, size } = notFilter.pager.process(req), //skip,size
                sorter = notFilter.sorter.process(req, thisSchema),
                search = notFilter.search.process(req, thisSchema);
            let filter = notFilter.filter.process(req, thisSchema);

            return {
                name: "query",
                value: { skip, size, sorter, search, filter },
            };
        }
    }
    return undefined;
};

const FactoryFormList = require("./form.list");

module.exports = (params) => {
    if (!params.actionName) {
        params.actionName = "listAndCount";
    }
    return FactoryFormList(params);
};

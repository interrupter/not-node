module.exports.GenericLogic = require("./logic.js");
module.exports.GenericRoute = require("./route.js");
module.exports.GenericGetByIdForm = require("./forms/form.getById.js");
module.exports.GenericGetByIDForm = require("./forms/form.getByID.js");
module.exports.GenericDataField = require("./field._data.js");
module.exports.GenericDataForm = require("./forms/form._data.js");
module.exports.GenericCreateForm = require("./forms/form.create.js");
module.exports.GenericUpdateForm = require("./forms/form.update.js");
module.exports.GenericAuthorizedActionForm = require("./forms/form.authorizedAction.js");
module.exports.GenericListAndCountForm = require("./forms/form.listAndCount.js");
module.exports.GenericListForm = require("./forms/form.list.js");

const FORMS = {};

module.exports.setCustomGenericForm = (name, factory) => {
    FORMS[name] = factory;
};

module.exports.getCustomGenericForm = (name) => {
    return FORMS[name];
};

const LOGICS = {};
module.exports.setCustomGenericLogic = (name, factory) => {
    LOGICS[name] = factory;
};

module.exports.getCustomGenericLogic = (name) => {
    return LOGICS[name];
};

const ROUTES = {};
module.exports.setCustomGenericRoute = (name, factory) => {
    ROUTES[name] = factory;
};

module.exports.getCustomGenericRoute = (name) => {
    return ROUTES[name];
};

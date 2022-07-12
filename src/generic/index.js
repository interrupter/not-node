module.exports.GenericLogic = require("./logic.js");
module.exports.GenericRoute = require("./route.js");
module.exports.GenericGetByIdForm = require("./form.getById.js");
module.exports.GenericGetByIDForm = require("./form.getByID.js");
module.exports.GenericListAndCountForm = require("./form.listAndCount.js");

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

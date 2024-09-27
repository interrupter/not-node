module.exports = {
    ui: {
        component: "UIHidden",
    },
    model: {
        safe: require("../safety.protocols").systemManageable,
        validate: require('./validators/objectId.list')
    },
};

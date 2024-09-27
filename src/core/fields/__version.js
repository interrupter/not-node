module.exports = {
    ui: {
        component: "UIHidden",
    },
    model: {
        safe: require("../safety.protocols").systemManageable,
        type: Number,
        default: 0,
        required: true,
        validate: require('./validators/ID')
    },
};

module.exports = {
    model: {
        type: String,
        required: false,
        safe: require("../safety.protocols").ownerRootAdmin,
        transformers: ["xss"],
        validate: require('./validators/modelName')
    },
    ui: {
        component: "UIHidden",
    },
};

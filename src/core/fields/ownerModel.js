module.exports = {
    model: {
        type: String,
        required: false,
        safe: require("../safety.protocols").ownerRootAdmin,
        transformers: ["xss"],
    },
    ui: {
        component: "UIHidden",
    },
};

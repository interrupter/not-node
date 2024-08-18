module.exports = {
    ui: {
        component: "UIEmail",
        placeholder: "not-node:field_email_placeholder",
        label: "not-node:field_email_label",
    },
    model: {
        type: String,
        required: true,
        transformers: ["xss"],
        safe: require("../safety.protocols").ownerRootAdmin,
    },
};

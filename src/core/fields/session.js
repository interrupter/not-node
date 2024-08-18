module.exports = {
    ui: {
        component: "UITextfield",
        label: "not-node:field_session_label",
        placeholder: "not-node:field_session_placeholder",
    },
    model: {
        type: String,
        searchable: true,
        required: true,
        transformers: ["xss"],
        safe: require("../safety.protocols").ownerRootAdmin,
    },
};

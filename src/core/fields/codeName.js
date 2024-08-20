module.exports = {
    ui: {
        component: "UITextfield",
        placeholder: "not-node:field_codeName_placeholder",
        label: "not-node:field_codeName_label",
        default: "",
    },
    model: {
        type: String,
        required: true,
        transformers: ["xss"],
        safe: require("../safety.protocols").ownerRootAdmin,
    },
};

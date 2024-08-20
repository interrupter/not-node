module.exports = {
    ui: {
        component: "UITelephone",
        placeholder: "not-node:field_telephone_placeholder",
        label: "not-node:field_telephone_label",
        default: "",
    },
    model: {
        type: String,
        required: true,
        transformers: ["xss"],
        safe: require("../safety.protocols").ownerRootAdmin,
    },
};

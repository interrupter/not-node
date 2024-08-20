module.exports = {
    ui: {
        component: "UITextarea",
        placeholder: "not-node:field_description_placeholder",
        label: "not-node:field_description_label",
        default: "",
    },
    model: {
        type: String,
        required: true,
        searchable: true,
        sortable: true,
        transformers: ["xss"],
        safe: require("../safety.protocols").ownerRootAdmin,
    },
};

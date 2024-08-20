module.exports = {
    ui: {
        component: "UITextfield",
        label: "not-node:field_height_label",
        placeholder: "not-node:field_height_placeholder",
        default: 0.0,
    },
    model: {
        type: Number,
        required: true,
        searchable: true,
        sortable: true,
        safe: require("../safety.protocols").ownerRootAdmin,
    },
};

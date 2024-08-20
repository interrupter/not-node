module.exports = {
    ui: {
        component: "UITextfield",
        placeholder: "not-node:field_price_placeholder",
        label: "not-node:field_price_label",
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

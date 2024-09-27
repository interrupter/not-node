module.exports = {
    ui: {
        component: "UITextfield",
        label: "not-node:field_size_label",
        placeholder: "not-node:field_size_placeholder",
        default: 0.0,
    },
    model: {
        type: Number,
        required: true,
        searchable: true,
        sortable: true,
        safe: require("../safety.protocols").ownerRootAdmin,
        validate: require('./validators/positive.or.zero.number')
    },
};

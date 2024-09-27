module.exports = {
    ui: {
        component: "UIDate",
        label: "not-node:field_updatedAt_label",
        placeholder: "not-node:field_updatedAt_placeholder",
        readonly: true,
    },
    model: {
        searchable: true,
        sortable: true,
        type: Date,
        required: true,
        default: Date.now,
        validate: require('./validators/date'),
        safe: require("../safety.protocols").systemManageable,
    },
};

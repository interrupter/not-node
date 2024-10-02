const Validators = require("../validators");

module.exports = {
    ui: {
        component: "UINumber",
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
        validate: [
            ...Validators.Number.type,
            ...Validators.Number.positiveOrZero,
        ],
    },
};

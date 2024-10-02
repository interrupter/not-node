const Validators = require("../validators");

module.exports = {
    ui: {
        component: "UITextfield",
        placeholder: "not-node:field_width_placeholder",
        label: "not-node:field_width_label",
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

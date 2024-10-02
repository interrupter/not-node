const Validators = require("../validators");

module.exports = {
    ui: {
        component: "UITextfield",
        placeholder: "not-node:field_ID_placeholder",
        label: "not-node:field_ID_label",
        readonly: true,
    },
    model: {
        type: Number,
        required: true,
        safe: require("../safety.protocols").ownerRootAdmin,
        validate: [
            ...Validators.Number.type,
            ...Validators.Number.int,
            ...Validators.Number.positive,
        ],
    },
};

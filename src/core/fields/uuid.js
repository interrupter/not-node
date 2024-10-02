const Validators = require("../validators");

module.exports = {
    ui: {
        component: "UITextfield",
        placeholder: "not-node:field_UUID_placeholder",
        label: "not-node:field_UUID_label",
        readonly: true,
        default: "",
    },
    model: {
        type: String,
        searchable: true,
        required: true,
        transformers: ["xss"],
        safe: require("../safety.protocols").ownerRootAdmin,
        validate: [...Validators.String.type, ...Validators.String.uuid],
    },
};

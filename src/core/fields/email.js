const Validators = require("../validators");

module.exports = {
    ui: {
        component: "UIEmail",
        placeholder: "not-node:field_email_placeholder",
        label: "not-node:field_email_label",
        default: "",
    },
    model: {
        type: String,
        required: true,
        transformers: ["xss"],
        safe: require("../safety.protocols").ownerRootAdmin,
        validate: [...Validators.String.type, ...Validators.String.email],
    },
};

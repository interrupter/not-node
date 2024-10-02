const Validators = require("../validators");

module.exports = {
    ui: {
        component: "UITextfield",
        label: "not-node:field_IP_label",
        placeholder: "not-node:field_IP_placeholder",
        default: "",
    },
    model: {
        type: String,
        searchable: true,
        required: true,
        safe: require("../safety.protocols").ownerRootAdmin,
        transformers: ["xss"],
        validate: [...Validators.String.type, ...Validators.String.ip],
    },
};

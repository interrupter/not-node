const Validators = require("../validators");

module.exports = {
    ui: {
        component: "UITextfield",
        label: "not-node:field_title_label",
        placeholder: "not-node:field_title_placeholder",
        default: "",
    },
    model: {
        type: String,
        required: true,
        searchable: true,
        sortable: true,
        safe: require("../safety.protocols").ownerRootAdmin,
        transformers: ["xss"],
        validate: [...Validators.String.type, ...Validators.String.notEmpty],
    },
};

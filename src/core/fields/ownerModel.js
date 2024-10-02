const Validators = require("../validators");

module.exports = {
    model: {
        type: String,
        required: false,
        safe: require("../safety.protocols").ownerRootAdmin,
        transformers: ["xss"],
        validate: [...Validators.String.type, ...Validators.String.notEmpty],
    },
    ui: {
        component: "UIHidden",
    },
};

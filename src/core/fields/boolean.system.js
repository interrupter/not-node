const Validators = require("../validators");

module.exports = {
    ui: {
        component: "UIHidden",
    },
    model: {
        type: Boolean,
        default: false,
        required: true,
        safe: require("../safety.protocols").systemManageable,
        validate: Validators.Boolean.type,
    },
};

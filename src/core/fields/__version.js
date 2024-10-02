const Validators = require("../validators");

module.exports = {
    ui: {
        component: "UIHidden",
    },
    model: {
        safe: require("../safety.protocols").systemManageable,
        type: Number,
        default: 0,
        required: true,
        validate: [
            ...Validators.Number.type,
            ...Validators.Number.int,
            ...Validators.Number.positiveOrZero,
        ],
    },
};

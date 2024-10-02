const Validators = require("../validators");

module.exports = {
    ui: {
        component: "UIHidden",
    },
    model: {
        safe: require("../safety.protocols").systemManageable,
        validate: Validators.ObjectId.list,
    },
};

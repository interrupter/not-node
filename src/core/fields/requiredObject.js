const Schema = require("mongoose").Schema;
const Validators = require("../validators");

module.exports = {
    model: {
        type: Schema.Types.Mixed,
        required: true,
        default: {},
        safe: require("../safety.protocols").ownerRootAdmin,
        validate: Validators.Object.type,
    },
    ui: {
        default: {},
    },
};

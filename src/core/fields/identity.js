const Validators = require("../validators");
const Schema = require("mongoose").Schema;

module.exports = {
    model: {
        type: Schema.Types.Mixed,
        required: true,
        safe: require("../safety.protocols").ownerRootAdmin,
        validate: Validators.Object.identity,
    },
};

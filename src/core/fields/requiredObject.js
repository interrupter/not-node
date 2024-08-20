const Schema = require("mongoose").Schema;

module.exports = {
    model: {
        type: Schema.Types.Mixed,
        required: true,
        default: {},
        safe: require("../safety.protocols").ownerRootAdmin,
    },
    ui: {
        default: {},
    },
};

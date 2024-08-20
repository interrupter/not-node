const ObjectId = require("mongoose").Schema.Types.ObjectId;

module.exports = {
    model: {
        type: ObjectId,
        required: true,
        default: null,
        transformers: ["xss", "__CLEAR__"],
        safe: require("../safety.protocols").ownerRootAdmin,
    },
    ui: {
        default: null,
    },
};

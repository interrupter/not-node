const ObjectId = require("mongoose").Schema.Types.ObjectId;

module.exports = {
    model: {
        type: ObjectId,
        required: true,
        default: {},
        transformers: ["xss", "__CLEAR__"],
        safe: require("../safety.protocols").ownerRootAdmin,
    },
};

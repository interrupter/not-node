const Validators = require("../validators");
const ObjectId = require("mongoose").Schema.Types.ObjectId;

module.exports = {
    model: {
        type: ObjectId,
        required: true,
        default: null,
        transformers: ["xss", "__CLEAR__"],
        safe: require("../safety.protocols").ownerRootAdmin,
        validate: Validators.ObjectId.type,
    },
    ui: {
        default: null,
    },
};

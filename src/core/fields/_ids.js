const Validators = require("not-node/src/core/validators");
const ObjectId = require("mongoose").SchemaTypes.ObjectId;

module.exports = {
    ui: {
        component: "UIHidden",
        placeholder: "_ids",
        label: "_ids",
        readonly: true,
    },
    model: {
        type: ObjectId,
        safe: require("not-node/src/core/safety.protocols").systemManageable,
        validate: Validators.ObjectId.list,
    },
};

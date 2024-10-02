const Validators = require("../validators");
const ObjectId = require("mongoose").SchemaTypes.ObjectId;

module.exports = {
    ui: {
        component: "UIHidden",
        placeholder: "_id",
        label: "_id",
        readonly: true,
    },
    model: {
        type: ObjectId,
        safe: require("../safety.protocols").systemManageable,
        validate: Validators.ObjectId.type,
    },
};

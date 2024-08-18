const Schema = require("mongoose").Schema;
const notFieldsFilter = require("../../fields/filter");
const { ownerRootAdmin } = require("../safety.protocols");
const { ACTION_SIGNATURES } = require("../../auth/const");

module.exports = {
    model: {
        type: Schema.Types.ObjectId,
        refPath: "ownerModel",
        required: false,
        safe: notFieldsFilter.mergeSafetyProtocols(ownerRootAdmin, {
            [ACTION_SIGNATURES.CREATE]: ["-@owner"],
            [ACTION_SIGNATURES.UPDATE]: ["-@owner"],
            [ACTION_SIGNATURES.DELETE]: ["-@owner"],
        }),
    },
    ui: {
        component: "UIHidden",
    },
};

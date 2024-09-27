const notFieldsFilter = require("../../fields/filter");
const { ownerRootAdmin } = require("../safety.protocols");
const { ACTION_SIGNATURES } = require("../../auth/const");

module.exports = {
    parent: 'not-node//objectId',
    model: {        
        refPath: "ownerModel",
        required: false,
        //owner cant change
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

const { MODULE_NAME } = require("../const");

module.exports = {
    parent: `${MODULE_NAME}//boolean`,
    ui: {        
        label: "not-node:field_enabled_label",        
    },
    model: {        
        default: true,
    },
};

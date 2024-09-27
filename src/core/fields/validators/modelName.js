const { MODULE_NAME } = require("not-node/src/core/const");

module.exports = [
    {
        validator: (val) => {
            return typeof val === "string";
        },
        message: `${MODULE_NAME}:modelName_value_is_not_string`,
    },
    {
        validator: (val) => {
            return val.length;
        },
        message: `${MODULE_NAME}:modelName_value_is_empty`,
    },
];

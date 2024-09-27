const { MODULE_NAME } = require("../../const");

module.exports = [
    {
        validator: (val) => {
            return typeof val === "string";
        },
        message: `${MODULE_NAME}:codeName_value_is_not_string`,
    },
    {
        validator: (val) => {
            return val.length;
        },
        message: `${MODULE_NAME}:codeName_value_is_empty`,
    },
];

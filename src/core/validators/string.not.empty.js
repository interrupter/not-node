const { MODULE_NAME } = require("../const");

module.exports = [
    ...require("./string"),
    {
        validator: (val) => {
            return typeof val === "string";
        },
        message: `${MODULE_NAME}:value_type_is_not_string`,
    },
    {
        validator: (val) => {
            return val.length;
        },
        message: `${MODULE_NAME}:value_is_empty`,
    },
];

const { MODULE_NAME } = require("../const");

module.exports = [
    {
        validator: (val) => {
            return typeof val === "object";
        },
        message: `${MODULE_NAME}:value_is_not_object`,
    },
];

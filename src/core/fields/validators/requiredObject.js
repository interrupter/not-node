const { MODULE_NAME } = require("not-node/src/core/const");

module.exports = [
    {
        validator: (val) => {
            return typeof val === "object";
        },
        message: `${MODULE_NAME}:requiredObject_value_is_not_object`,
    },
];

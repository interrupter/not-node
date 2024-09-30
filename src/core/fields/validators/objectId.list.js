const objectId = require("./objectId.js");

module.exports = [
    {
        validator: (val) => {
            return Array.isArray(val);
        },
        message: `not-node:value_is_not_array`,
    },
    ...objectId,
];

const objectId = require("./objectId.js");

module.exports = [
    {
        validator: (val) => {
            return Array.isArray(val);
        },
        message: `not-node:value_is_not_array`,
    },
    {
        validator: (val, envs) => {
            return val.every((item) => objectId.at(0)?.validator(item, envs));
        },
        message: `not-node:value_items_are_not_all_objectId`,
    },
];

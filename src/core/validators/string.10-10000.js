const { MODULE_NAME } = require("../const");

const DEFAULT_MIN_LEN = 10;
const DEFAULT_MAX_LEN = 10000;

module.exports = [
    ...require("./string"),
    {
        validator: (val, { config }) => {
            const MIN_LEN =
                (config && config.get(`fields.description.minLen`)) ||
                DEFAULT_MIN_LEN;
            if (val.length < MIN_LEN) {
                return false;
            }
            return true;
        },
        message: `${MODULE_NAME}:value_is_too_short_10`,
    },
    {
        validator: (val, { config }) => {
            const MAX_LEN =
                (config && config.get(`fields.description.maxLen`)) ||
                DEFAULT_MAX_LEN;
            if (val.length > MAX_LEN) {
                return false;
            }
            return true;
        },
        message: `${MODULE_NAME}:value_is_too_long_10000`,
    },
];

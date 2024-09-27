const { MODULE_NAME } = require("../../const");

const DEFAULT_DESCRIPTION_MIN_LENGTH = 10;
const DEFAULT_DESCRIPTION_MAX_LENGTH = 10000;

module.exports = [
    {
        validator: (val) => {
            return typeof val === "string";
        },
        message: `${MODULE_NAME}:description_value_is_not_string`,
    },
    {
        validator: (val, { config }) => {
            const MIN_LEN = config.get("fields.description.minLength") || DEFAULT_DESCRIPTION_MIN_LENGTH;
            if (val.length < MIN_LEN) {
                return false;
            }
            return true;
        },
        message: `${MODULE_NAME}:description_value_is_too_short`,
    },
    {
        validator: (val, { config }) => {
            const MAX_LEN = config.get("fields.description.maxLength") || DEFAULT_DESCRIPTION_MAX_LENGTH;
            if (val.length > MAX_LEN) {
                return false;
            }
            return true;
        },
        message: `${MODULE_NAME}:description_value_is_too_long`,
    },
];

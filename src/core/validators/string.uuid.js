module.exports = [
    ...require("./string"),
    {
        validator(val, { validator }) {
            return validator.isUUID(val);
        },
        message: "not-node:value_is_not_uuid",
    },
];

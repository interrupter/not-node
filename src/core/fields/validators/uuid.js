module.exports = [
    {
        validator(val, { validator }) {
            return validator.isUUID(val);
        },
        message: "not-node:uuid_is_not_valid",
    },
];

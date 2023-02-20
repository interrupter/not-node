module.exports = [
    {
        validator(val, { validator }) {
            return validator.isMongoId(val);
        },
        message: "not-node:owner_is_not_valid",
    },
];

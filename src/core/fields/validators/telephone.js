module.exports = [
    {
        validator(val, { validator }) {
            return validator.isMobilePhone(val);
        },
        message: "not-node:telephone_is_not_valid",
    },
];

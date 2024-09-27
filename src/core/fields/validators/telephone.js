module.exports = [
    {
        validator(val, { validator }) {
            return validator.isMobilePhone(val.replace(/\D/g, ""));
        },
        message: "not-node:telephone_is_not_valid",
    },
];

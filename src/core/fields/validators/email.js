module.exports = [
    {
        validator(val, { validator }) {
            return validator.isEmail(val);
        },
        message: "not-node:email_is_not_valid",
    },
];

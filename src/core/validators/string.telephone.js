module.exports = [
    ...require("./string"),
    {
        validator(val, { validator }) {
            return validator.isMobilePhone(val.replace(/\D/g, ""));
        },
        message: "not-node:value_is_not_telephone",
    },
];

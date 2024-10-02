module.exports = [
    ...require("./string"),
    {
        validator(val, { validator }) {
            return validator.isIP(val);
        },
        message: "not-node:value_is_not_ip_address",
    },
];

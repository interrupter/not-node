module.exports = [
    ...require("./string"),
    {
        validator(val, { validator }) {
            if (val.indexOf(",") > -1) {
                return val
                    .split(",")
                    .map((ip) => ip.trim())
                    .every((ip) => validator.isIP(ip));
            } else {
                return validator.isIP(val);
            }
        },
        message: "not-node:value_is_not_ip_address",
    },
];

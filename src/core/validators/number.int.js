module.exports = [
    ...require("./number"),
    {
        validator(val) {
            return val.toString() === Math.round(val).toString();
        },
        message: "not-node:value_is_not_integer",
    },
];

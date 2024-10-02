module.exports = [
    ...require("./number"),
    {
        validator(val) {
            return val > 0;
        },
        message: "not-node:value_should_be_greater_than_zero",
    },
];

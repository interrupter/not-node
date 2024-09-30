module.exports = [
    {
        validator(val) {
            return !isNaN(val);
        },
        message: "not-node:value_is_not_number",
    },
    {
        validator(val) {
            return val >= 0;
        },
        message: "not-node:value_should_be_greater_than_zero",
    },
];

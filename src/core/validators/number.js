module.exports = [
    {
        validator(val) {
            return typeof val === "number";
        },
        message: "not-node:value_is_not_number",
    },
];

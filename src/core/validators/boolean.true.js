module.exports = [
    {
        validator(val) {
            return typeof val === "boolean" && val;
        },
        message: "not-node:value_type_is_not_boolean_true",
    },
];

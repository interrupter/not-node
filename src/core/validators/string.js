module.exports = [
    {
        validator(val) {
            return typeof val === "string";
        },
        message: "not-node:value_type_is_not_string",
    },
];

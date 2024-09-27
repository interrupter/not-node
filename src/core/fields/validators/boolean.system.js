module.exports = [
    {
        validator(val) {
            return typeof val === 'boolean';
        },
        message: "not-node:value_is_not_boolean",
    },
];

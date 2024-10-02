module.exports = [
    {
        validator(val, { validator }) {
            return (
                val instanceof Date ||
                (typeof val === "string" && validator.isISO8601(val))
            );
        },
        message: "not-node:value_type_is_not_date",
    },
];

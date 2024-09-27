module.exports = [
    {
        validator(val, {validator}) {
            return (val instanceof Date) || validator.isISO8601(val);
        },
        message: "not-node:value_is_not_date",
    },
];

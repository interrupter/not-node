module.exports = [
    {
        validator: (val, { validator }) => {
            return (
                (typeof val === "string" && validator.isMongoId(val)) ||
                (typeof val.toString === "function" &&
                    validator.isMongoId(val.toString()))
            );
        },
        message: `not-node:value_item_format_is_not_objectId`,
    },
];

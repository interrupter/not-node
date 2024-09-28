module.exports = [
    {
        validator: (val, { validator }) => {
            return validator.isMongoId(val);
        },
        message: `not-node:value_item_format_is_not_objectId`,
    },
];

module.exports = [
    {
        validator: (val) => {
            return Array.isArray(val);
        },
        message: `not-node:value_is_not_array`,
    },    
    {
        validator: (val, { validator }) => {
            return val.every((itm) => validator.isMongoId(itm));
        },
        message: `not-node:value_item_format_is_not_objectId`,
    },
];

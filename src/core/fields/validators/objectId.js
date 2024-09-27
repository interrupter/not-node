

module.exports = [    
    {
        validator: (val, { validator }) => {
            return val.every((itm) => validator.isMongoId(itm));
        },
        message: `not-node:value_item_format_is_not_objectId`,
    },
];

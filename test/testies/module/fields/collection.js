module.exports = {
    FIELDS: {
        collectionItem: {
            ui: {
                component: "UITextfield",
                placeholder: "collectionItem",
                label: "collectionItem",
                readonly: true,
            },
            model: {
                type: String,
                searchable: true,
                required: true,
            },
        },
    },
};

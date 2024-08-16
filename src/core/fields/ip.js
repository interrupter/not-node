module.exports = {
    ui: {
        component: "UITextfield",
        label: "not-node:field_IP_label",
        placeholder: "not-node:field_IP_placeholder",
    },
    model: {
        type: String,
        searchable: true,
        required: true,
        transformers: ['xss']
    },
};

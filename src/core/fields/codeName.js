module.exports = {
    ui: {
        component: "UITextfield",
        placeholder: "not-node:field_codeName_placeholder",
        label: "not-node:field_codeName_label",
    },
    model: {
        type: String,
        required: true,
        transformers: ["xss"],
        safe: {
            update: ["@owner", "root", "admin"],
            read: ["@owner", "root", "admin"],
        },
    },
};

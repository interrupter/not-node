module.exports = {
    ui: {
        component: "UIDate",
        label: "not-node:field_createdAt_label",
        placeholder: "not-node:field_createdAt_placeholder",
        readonly: true,
    },
    model: {
        type: Date,
        required: true,
        default: Date.now,
        searchable: true,
        sortable: true,
        safe: {
            update: ["@owner", "root", "admin"],
            read: ["@owner", "root", "admin"],
        },
    },
};

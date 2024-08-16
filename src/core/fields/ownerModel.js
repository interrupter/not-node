module.exports = {
    model: {
        type: String,
        required: false,
        safe: {
            update: ["@owner", "root", "admin"],
            read: ["@owner", "root", "admin"],
        },
        transformers: ['xss']
    },
    ui: {
        component: "UIHidden",
    },
};

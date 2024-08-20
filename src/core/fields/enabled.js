module.exports = {
    ui: {
        component: "UISwitch",
        label: "not-node:field_enabled_label",
        default: false,
    },
    model: {
        type: Boolean,
        default: true,
        required: true,
        safe: require("../safety.protocols").ownerRootAdmin,
    },
};

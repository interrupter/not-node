module.exports = {
    ui: {
        component: "UISwitch",
        label: "not-node:field_default_label",
    },
    model: {
        type: Boolean,
        default: false,
        required: true,
        safe: require("../safety.protocols").ownerRootAdmin,
    },
};

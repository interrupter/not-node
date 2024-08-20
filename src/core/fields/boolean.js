module.exports = {
    ui: {
        component: "UISwitch",
        label: "not-node:field_boolean_label",
        default: false,
    },
    model: {
        type: Boolean,
        default: false,
        required: true,
        safe: require("../safety.protocols").ownerRootAdmin,
    },
};

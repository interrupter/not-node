module.exports = {   
    ui: {
        component: "UIHidden",
    },
    model: {
        type: Boolean,
        default: false,
        required: true,
        safe: require("not-node/src/core/safety.protocols").systemManageable,
    },
};

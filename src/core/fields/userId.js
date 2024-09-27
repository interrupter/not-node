
module.exports = {
    parent: 'not-node//objectId',
    ui: {
        component: "UITextfield",
        label: "not-node:field_userId_label",
        placeholder: "not-node:field_userId_placeholder",
        readonly: true,
    },
    model: {        
        ref: "User",
        required: false,
        default: undefined,        
    },
};

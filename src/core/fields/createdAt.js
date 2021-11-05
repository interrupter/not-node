module.exports = {
  ui:{
    component: 'UITextfield',
    label: 'core:field_createdAt_label',
    placeholder: "core:field_createdAt_placeholder",
    readonly: true
  },
  model: {
    type: Date,
    required: true,
    default: Date.now,
    searchable: true,
    sortable: true,
    safe: {
      update: ['@owner', 'root', 'admin'],
      read: ['@owner', 'root', 'admin']
    }
  }
};

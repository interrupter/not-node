module.exports = {
  ui:{
    component: 'UITextfield',
    label: 'core:field_updatedAt_label',
    placeholder: 'core:field_updatedAt_placeholder',
    readonly: true
  },
  model: {
    searchable: true,
    sortable: true,
    type: Date,
    required: true,
    default: Date.now,
    safe: {
      update: ['@owner', 'root', 'admin'],
      read: ['@owner', 'root', 'admin']
    }
  }
};

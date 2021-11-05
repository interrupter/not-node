module.exports = {
  ui:{
    component: 'UITextfield',
    label: 'core:field_expiredAt_label',
    placeholder: 'core:field_expiredAt_placeholder',
    readonly: true
  },
  model:{
    type: Date,
    required: false,
    searchable: true,
    sortable: true,
    safe: {
      update: ['@owner', 'root', 'admin'],
      read: ['@owner', 'root', 'admin']
    }
  }
};

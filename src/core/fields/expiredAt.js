module.exports = {
  ui:{
    component: 'UITextfield',
    label: 'not-node:field_expiredAt_label',
    placeholder: 'not-node:field_expiredAt_placeholder',
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

module.exports = {
  ui: {
    component: 'UITextfield',
    label: 'core:field_title_label',
    placeholder: 'core:field_title_placeholder',
  },
  model: {
    type: String,
    required: true,
    searchable: true,
    sortable: true,
    safe: {
      update: ['@owner', 'root', 'admin'],
      read: ['@owner', 'root', 'admin']
    }
  }
};

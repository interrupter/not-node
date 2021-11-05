
const Schema = require('mongoose').Schema;

module.exports = {
  ui:{
    component: 'UITextfield',
    label: 'core:field_userId_label',
    placeholder: 'core:field_userId_placeholder'
  },
  model: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
};

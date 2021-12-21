
const Schema = require('mongoose').Schema;

module.exports = {
  ui:{
    component: 'UITextfield',
    label: 'not-node:field_userId_label',
    placeholder: 'not-node:field_userId_placeholder'
  },
  model: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
};

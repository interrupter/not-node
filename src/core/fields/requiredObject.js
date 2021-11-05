const Schema = require('mongoose').Schema;

module.exports = {
  model: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
    safe: {
      update: ['@owner', 'root', 'admin'],
      read: ['@owner', 'root', 'admin']
    }
  }
};

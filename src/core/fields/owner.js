const Schema = require('mongoose').Schema;
module.exports = {
  model:{
    type: Schema.Types.ObjectId,
    refPath: 'ownerModel',
    required: false,
    safe: {
      update: ['root', 'admin'],
      read: ['@owner', 'root', 'admin']
    }
  },
  ui:{
    component: 'UIHidden'
  }
};

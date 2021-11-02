const Schema = require('mongoose').Schema;

exports.keepNotExtended = true;
exports.thisModelName = 'PlainModel';
exports.thisSchema = {
  name: {
    type: String,
    required: true,
    searchable: true,
    sortable: true
  },
  default: {
    type: Boolean,
    default: false,
    required: true
  },
  price: {
    type: Number,
    required: true,
    searchable: true,
    sortable: true
  },
  image: {
    type: String,
    required: false
  }
};

exports.thisVirtuals = {
  bar: {
    set: () => {},
    get: () => {},
  }
};

exports.thisPre = {
  update: (...args) => {
    console.log('pre update ', ...args);
  }
};

exports.thisPost = {
  update: (...args) => {
    console.log('post update ', ...args);
  }
};

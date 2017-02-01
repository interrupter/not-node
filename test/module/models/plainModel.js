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
    price:{
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

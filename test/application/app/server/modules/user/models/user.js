const Schema = require('mongoose').Schema;

exports.thisModelName = 'User';
exports.enrich = {
	versioning: true,
	increment: true,
	validators: true
};
exports.thisStatics = {};
exports.thisMethods = {

};
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

exports.thisModelName = 'UserLocalNotIncremental';

exports.enrich = {
	versioning: true,
	increment: false,
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

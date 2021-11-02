exports.modelName = 'User';
exports.statics = {
	getItOn:()=>{
		return true;
	}
};
exports.methods = {

};
exports.schema = {
	mixture: {
		type: String,
		required: true,
		searchable: true,
		sortable: true
	}
};

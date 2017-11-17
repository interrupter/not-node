const filter = require('./filter'),
	search = require('./search'),
	sorter = require('./sorter');


exports.parse = (queryString, modelSchema) => {
	return {
		filter: filter.parse(queryString.filter, modelSchema),
		search: search.parse(queryString.search, modelSchema),
		sorter: sorter.parse(queryString.sorter, modelSchema)
	};
};

exports.filter = filter;
exports.search = search;
exports.sorter = sorter;

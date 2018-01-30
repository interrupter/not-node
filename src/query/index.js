const filter = require('./filter'),
	search = require('./search'),
	sorter = require('./sorter');


exports.parse = (queryString, modelSchema) => {
	return {
		filter: filter.getFilter(queryString.filter, modelSchema),
		search: search.getSearch(queryString.search, modelSchema),
		sorter: sorter.getSorter(queryString.sorter, modelSchema)
	};
};

exports.filter = filter;
exports.search = search;
exports.sorter = sorter;

exports.getFilter = filter.getFilter;
exports.getSearch = search.getSearch;
exports.getSorter = sorter.getSorter;

const escapeStringRegexp = require('escape-string-regexp');

exports.getFilter = function(requestQuery, modelSchema) {
	var result = [];
	//есть ли фильтрация по полям
	if(requestQuery.hasOwnProperty('filterSearch') && requestQuery.filterSearch !== null && requestQuery.filterSearch.length > 0) {
		var filterSearch = requestQuery.filterSearch.toString(),
			filterSearchNumber = parseInt(filterSearch),
			searchRule = new RegExp('.*' + escapeStringRegexp(filterSearch) + '.*', 'i');
		for(var k in modelSchema) {
			if(modelSchema[k].searchable && !(requestQuery.hasOwnProperty(k) && requestQuery[k].length > 0)) {
				var emptyRule = {};
				switch(modelSchema[k].type) {
					case Number:
						if(isNaN(filterSearchNumber)) {
							continue;
						} else {
							emptyRule[k] = filterSearchNumber;
						}
						break;
					case Boolean:
					case String:
					default:
						emptyRule[k] = searchRule;
				}
				result.push(emptyRule);
			}
		}
	}

	for(var k in modelSchema) {
		if(modelSchema[k].searchable && requestQuery.hasOwnProperty(k) && typeof requestQuery[k] !== 'undefined' && requestQuery[k] !== null ) {
			var emptyRule = {};
			var searchString = requestQuery[k];
			var searchNumber = parseFloat(searchString);
			switch(modelSchema[k].type) {
				case Number:
					if(isNaN(searchNumber)) {
						continue;
					} else {
						emptyRule[k] = searchNumber;
					}
					break;
				case String:
				default:
					emptyRule[k] = searchString;
			}
			result.push(emptyRule);
		}
	}
	return result;
};

var sorterDefaultsLocal = {
	'_id': 1
};

var sorterDefaultsLocal_Direction = 1;

exports.sorterDefaultsLocal = sorterDefaultsLocal;
exports.sorterDefaultsLocal_Direction = sorterDefaultsLocal_Direction;

exports.getSorter = function(requestQuery, modelSchema, sorterDefaults /* optional */ ) {
	if(typeof sorterDefaults === 'undefined' || sorterDefaults === null) {
		var result = sorterDefaultsLocal;
	} else {
		var result = sorterDefaults;
	}
	if(requestQuery.hasOwnProperty('sortByField') && requestQuery.sortByField !== null) {
		var sortByField = requestQuery.sortByField;
		var sortDirection = parseInt(requestQuery.sortDirection);
		//санация данных
		switch(sortDirection) {
			case -1:
				sortDirection = -1;
				break;
			case 1:
				sortDirection = 1;
				break;
			default:
				sortDirection = sorterDefaultsLocal_Direction;
		}
		if(modelSchema.hasOwnProperty(sortByField) && (Object.keys(modelSchema).indexOf(sortByField) > -1)) {
			if(modelSchema[sortByField].hasOwnProperty('sortable') && modelSchema[sortByField].sortable) {
				//все чисто - можно отправлять в базу
				if(result === sorterDefaults || result === sorterDefaultsLocal) {
					result = {};
				}
				result[sortByField] = sortDirection;
			}
		}
	}
	return result;
};

const escapeStringRegexp = require('escape-string-regexp'),
	lowerCase = require('lower-case');

const getBoolean = (val) => {
	let t = parseInt(val),
		s = lowerCase(val);
	if (t === 0 || t === 1) {
		return !!t;
	} else {
		if (s === 'true') {
			return true;
		} else if (s === 'false') {
			return false;
		} else {
			return undefined;
		};
	}
};

exports.getFilter = function (requestQuery, modelSchema) {
	var result = [];
	//есть ли фильтрация по полям
	if (requestQuery.hasOwnProperty('filterSearch') && requestQuery.filterSearch !== null && requestQuery.filterSearch.length > 0) {
		var filterSearch = requestQuery.filterSearch.toString(),
			filterSearchNumber = parseInt(filterSearch),
			searchRule = new RegExp('.*' + escapeStringRegexp(filterSearch) + '.*', 'i');
		for (let k in modelSchema) {
			if (modelSchema[k].searchable && !(requestQuery.hasOwnProperty(k) && requestQuery[k].length > 0)) {
				let emptyRule = {};
				switch (modelSchema[k].type) {
				case Number:
					if (isNaN(filterSearchNumber)) {
						continue;
					} else {
						emptyRule[k] = filterSearchNumber;
					}
					break;
				case Boolean:
					let t = getBoolean(searchRule);
					if (typeof t !== 'undefined') {
						emptyRule[k] = t;

					}
					break;
				case String:
					emptyRule[k] = searchRule;
					break;
				default:
					continue;
				}
				if (Object.getOwnPropertyNames(emptyRule).length > 0) {
					result.push(emptyRule);
				}
			}
		}
	}

	for (let k in modelSchema) {
		if (modelSchema[k].searchable && requestQuery.hasOwnProperty(k) && typeof requestQuery[k] !== 'undefined' && requestQuery[k] !== null) {
			let emptyRule = {},
				searchString = requestQuery[k],
				searchNumber = parseFloat(searchString);
			switch (modelSchema[k].type) {
			case Number:
				if (isNaN(searchNumber)) {
					continue;
				} else {
					emptyRule[k] = searchNumber;
				}
				break;
			case Boolean:
				let t = getBoolean(searchString);
				if (typeof t !== 'undefined') {
					emptyRule[k] = t;
				}
				break;
			case String:
				emptyRule[k] = searchString;
				break;
			default:
				continue;
			}
			if (Object.getOwnPropertyNames(emptyRule).length > 0) {
				result.push(emptyRule);
			}
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

exports.getSorter = function (requestQuery, modelSchema, sorterDefaults /* optional */ ) {
	if (typeof sorterDefaults === 'undefined' || sorterDefaults === null) {
		var result = sorterDefaultsLocal;
	} else {
		var result = sorterDefaults;
	}
	if (requestQuery.hasOwnProperty('sortByField') && requestQuery.sortByField !== null) {
		let sortByField = requestQuery.sortByField,
			sortDirection = parseInt(requestQuery.sortDirection);
		if (sortByField.charAt(0) === ':') {
			sortByField = sortByField.substring(1);
		}
		//санация данных
		switch (sortDirection) {
		case -1:
			sortDirection = -1;
			break;
		case 1:
			sortDirection = 1;
			break;
		default:
			sortDirection = sorterDefaultsLocal_Direction;
		}
		if (modelSchema.hasOwnProperty(sortByField) && (Object.keys(modelSchema).indexOf(sortByField) > -1)) {
			if (modelSchema[sortByField].hasOwnProperty('sortable') && modelSchema[sortByField].sortable) {
				//все чисто - можно отправлять в базу
				if (result === sorterDefaults || result === sorterDefaultsLocal) {
					result = {};
				}
				result[sortByField] = sortDirection;
			}
		}
	}
	return result;
};

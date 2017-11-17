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
		}
	}
};

module.exports = (requestQuery, modelSchema) => {
	var result = [],t;
	//есть ли фильтрация по полям
	if (requestQuery.hasOwnProperty('filterSearch') && requestQuery.filterSearch !== null && requestQuery.filterSearch.length > 0) {
		let filterSearch = requestQuery.filterSearch.toString(),
			filterSearchNumber = parseInt(filterSearch),
			searchRule = new RegExp('.*' + escapeStringRegexp(filterSearch) + '.*', 'i');
		for (let k in modelSchema) {
			t = undefined;
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
					t = getBoolean(searchRule);
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
		t = undefined;
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
				t = getBoolean(searchString);
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

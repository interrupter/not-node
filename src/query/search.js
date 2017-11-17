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
	if (requestQuery.hasOwnProperty('search') && requestQuery.search !== null && requestQuery.search.length > 0) {
		let filterSearch = requestQuery.search.toString(),
			filterSearchNumber = parseInt(filterSearch),
			searchRule = new RegExp('.*' + escapeStringRegexp(filterSearch) + '.*', 'i');
		for (let k in modelSchema) {
			t = undefined;
			if (modelSchema[k].searchable) {
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
	return result;
};

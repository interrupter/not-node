const lowerCase = require('lower-case');

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

exports.getFilter = (requestQuery, modelSchema) => {
	var result = [], t;	
	if (requestQuery.hasOwnProperty('filter') && requestQuery.filter !== null){
		for (let k in modelSchema) {
			t = undefined;
			if (modelSchema[k].searchable && requestQuery.filter.hasOwnProperty(k) && typeof requestQuery.filter[k] !== 'undefined' && requestQuery.filter[k] !== null) {
				let emptyRule = {},
					searchString = requestQuery.filter[k],
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
	}
	return result;
};


var sorterDefaultsLocal = {
	'_id': 1
};

var sorterDefaultsLocal_Direction = 1;

exports.sorterDefaultsLocal = sorterDefaultsLocal;
exports.sorterDefaultsLocal_Direction = sorterDefaultsLocal_Direction;

exports.getSorter = function (requestQuery, modelSchema, sorterDefaults /* optional */ ) {
	let result;
	if (typeof sorterDefaults === 'undefined' || sorterDefaults === null) {
		result = sorterDefaultsLocal;
	} else {
		result = sorterDefaults;
	}
	if (requestQuery.hasOwnProperty('sortByField') && requestQuery.sortByField !== null) {
		let sortByField = requestQuery.sortByField,
			sortByProperty,
			sortDirection = parseInt(requestQuery.sortDirection);
		if (sortByField.charAt(0) === ':') {
			sortByField = sortByField.substring(1);
		}
		if (sortByField.indexOf('.') > -1) {
			sortByProperty = sortByField.split('.')[0];
		} else {
			sortByProperty = sortByField;
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
		if (modelSchema.hasOwnProperty(sortByProperty) && (Object.keys(modelSchema).indexOf(sortByProperty) > -1)) {
			if (modelSchema[sortByProperty].hasOwnProperty('sortable') && modelSchema[sortByProperty].sortable) {
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

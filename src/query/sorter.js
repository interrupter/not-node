
let sorterDefaultsLocal = {
	'_id': 1
};

let sorterDefaultsLocal_Direction = 1;

exports.sorterDefaultsLocal = sorterDefaultsLocal;
exports.sorterDefaultsLocal_Direction = sorterDefaultsLocal_Direction;

function extractSortRule(rawInput, schema, defaults){
	let result = {},
		field = rawInput.field,
		dir = rawInput.dir,
		property;
	if (!field){
		return false;
	}
	if (!dir){
		dir = sorterDefaultsLocal_Direction;
	}
	if (field.charAt(0) === ':') {
		field = field.substring(1);
	}
	if (field.indexOf('.') > -1) {
		property = field.split('.')[0];
	} else {
		property = field;
	}
	//санация данных
	switch (dir) {
	case -1:
		dir = -1;
		break;
	case 1:
		dir = 1;
		break;
	default:
		dir = sorterDefaultsLocal_Direction;
	}
	if (schema.hasOwnProperty(property) && (Object.keys(schema).indexOf(property) > -1)) {
		if (schema[property].hasOwnProperty('sortable') && schema[property].sortable) {
			//все чисто - можно отправлять в базу
			if (result === defaults || result === sorterDefaultsLocal) {
				result = {};
			}
			result[field] = dir;
		}
	}
	return result;
}

/**
*
*/

exports.getSorter = function (requestQuery, modelSchema, sorterDefaults /* optional */ ) {
	let result, result2 = {};
	if (typeof sorterDefaults === 'undefined' || sorterDefaults === null) {
		result = sorterDefaultsLocal;
	} else {
		result = sorterDefaults;
	}
	if (requestQuery.hasOwnProperty('sorter') && requestQuery.sorter) {
		if (Array.isArray(requestQuery.sorter)){
			for(let rule of requestQuery.sorter){
				let res = extractSortRule(rule,modelSchema ,sorterDefaults);
				if (res && res !== {}){
					result2 = Object.assign(result2, res);
				}
			}
		}else{
			let res = extractSortRule(requestQuery.sorter,modelSchema ,sorterDefaults);
			if (res && res !== {}){
				result2 = Object.assign(result2, res);
			}
		}
	}
	if (Object.keys(result2).length > 0){
		return result2;
	}else{
		return result;
	}
};

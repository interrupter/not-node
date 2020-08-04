const FIELDS = {
	_id: {
		ui: {
			component: 'UIHidden',
			placeholder: '_id',
			label: '_id',
			readonly: true
		}
	},
	ID: {
		ui: {
			component: 'UITextfield',
			placeholder: 'ID',
			label: 'ID',
			readonly: true
		}
	},
	title: {
		ui: {
			component: 'UITextfield',
			placeholder: 'Будет показываться пользователю',
			label: 'Название'
		},
		model: {
			type: String,
			required: true,
			searchable: true,
			sortable: true
		}
	},
	codeName: {
		ui: {
			component: 'UITextfield',
			placeholder: 'codeName',
			label: 'Кодовое имя на английском, для служебного пользования'
		},
		model: {
			type: String,
			required: true
		}
	},
	default: {
		ui:{
			component: 'UISwitch',
			label: 'Основной'
		},
		model:{
			type: Boolean,
			default: false,
			required: true
		}
	},
	enabled: {
		ui:{
			component: 'UISwitch',
			label: 'Доступен'
		},
		model:{
			type: Boolean,
			default: true,
			required: true
		}
	},
	active: {
		ui:{
			component: 'UISwitch',
			label: 'Активна'
		},
		model:{
			type: Boolean,
			default: false,
			required: true
		}
	},
	price: {
		ui:{
			component: 'UITextfield',
			placeholder: 'Стоимость',
			label: 'Стоимость'
		},
		model:{
			type: Number,
			required: true,
			searchable: true,
			sortable: true
		}
	},
	description: {
		ui:{
			component: 'UITextarea',
			placeholder: 'Описание',
			label: 'Описание'
		},
		model:{
			type: String,
			required: true,
			searchable: true,
			sortable: true
		}
	},
	width: {
		ui:{
			component: 'UITextfield',
			placeholder: 'Ширина',
			label: 'Ширина'
		},
		model:{
			type: Number,
			required: true,
			searchable: true,
			sortable: true
		}
	},
	height: {
		ui:{
			component: 'UITextfield',
			label: 'Высота',
			placeholder: 'Высота'
		},
		model:{
			type: Number,
			required: true,
			searchable: true,
			sortable: true
		}
	},
};

/**
list = [
	'title', //for standart only name
	['titleNonStandart', {component: 'UITextforBlind'}] //arrays of [name, mutation]
	['someID', {}, 'ID'],  //copy of standart ID field under name as someID
]
*/
exports.initFields = (list, type = 'ui') => {
	let fields = {};
	list.forEach((field) => {
		let res = exports.initField(field, false, type);
		fields[res[0]] = res[1];
	});
	return fields;
};

exports.initField = (field, resultOnly = true, type = 'ui') => {
	let srcName, destName, mutation = {};
	if (Array.isArray(field)) {
		destName = srcName = field[0];
		mutation = field[1];
		if (field.length === 3) {
			srcName = field[2];
		}
	} else {
		destName = srcName = field;
	}
	let proto = (Object.prototype.hasOwnProperty.call(FIELDS, srcName) && Object.prototype.hasOwnProperty.call(FIELDS[srcName], type)) ? FIELDS[srcName][type]:{};
	let result = Object.assign({}, proto, mutation);
	if (resultOnly) {
		return result;
	} else {
		return [destName, result];
	}
};

function getMutationForField(name, list) {
	let mutation = false;
	list.forEach((item) => {
		if (Array.isArray(item)) {
			if (item[0] === name) {
				mutation = item;
			}
		}
	});
	return mutation;
}

exports.fromSchema = (schema, rawMutationsList = []) => {
	let
		//copy array
		mutationsList = [...rawMutationsList],
		list = [];
	if (schema && Object.keys(schema).length > 0) {
		let rawKeys = Object.keys(schema);
		rawKeys.forEach((key) => {
			let mutation = getMutationForField(key, mutationsList);
			if (mutation) {
				list.push(mutation);
				mutationsList.splice(mutationsList.indexOf(mutation), 1);
			} else {
				list.push(key);
			}
		});
		list.push(...mutationsList);
		return exports.initFields(list);
	}

};

exports.LIB = FIELDS;
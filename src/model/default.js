const routine = require('./routine');
exports.extractVariants = function (items) {
	var variants = [];
	if (items && items.length) {
		for (var i = 0; i < items.length; i++) {
			variants.push(items[i].getVariant());
		}
	}
	return variants;
};

let populateQuery = (query, populate) => {
	if (populate && populate.length) {
		while (populate.length > 0) {
			query.populate({
				path: populate.shift(),
				match: {
					__latest: true
				}
			});
		}
	}
};

exports.statics = {
	sanitizeInput(input) {
		if (!input.hasOwnProperty('default')) {
			input.default = false;
		}
		return input;
	},
	getOne(id) {
		if (this.schema.statics.__versioning) {
			let query = this.findOne({
				_id: id,
				__latest: true,
				__closed: false
			}).populate('__versions');
			return query.exec();
		} else {
			let query = this.findOne({
				_id: id
			});
			return query.exec();
		}
	},
	getOneByID(ID) {
		if (this.schema.statics.__incField) {
			let by = (this.schema.statics.__versioning ? {
					__latest: true,
					__closed: false
				} : {}),
				query;
			by[this.schema.statics.__incField] = ID;
			query = this.findOne(by);
			return query.exec();
		} else {
			return null;
		}
	},
	getOneRaw(id) {
		let query = this.findOne({
			_id: id
		});
		return query.exec();
	},
	list(skip, size, sorter, filter){
		let by = this.schema.statics.__versioning ? {
				__latest: true,
				__closed: false
			} : {},
			query = this.find(by);
		if (Array.isArray(filter) && filter.length > 0) {
			if (by.hasOwnProperty('__latest')) {
				query.or(filter);
			} else {
				let t = {};
				while (Object.getOwnPropertyNames(t).length === 0 && filter.length > 0) {
					t = filter.pop();
				}
				if (Object.getOwnPropertyNames(t).length > 0) {
					query = this.find(t);
					if (filter.length > 0) {
						query.or(filter);
					}
				}
			}
		}
		return query.sort(sorter).skip(skip).limit(size).exec();
	},
	countWithFilter(filter){
		let by = this.schema.statics.__versioning ? {
				__latest: true,
				__closed: false
			} : {},
			query = this.count(by);
		if (Array.isArray(filter) && filter.length > 0) {
			if (by.hasOwnProperty('__latest')) {
				query.or(filter);
			} else {
				let t = {};
				while (Object.getOwnPropertyNames(t).length === 0 && filter.length > 0) {
					t = filter.pop();
				}
				if (Object.getOwnPropertyNames(t).length > 0) {
					query = this.find(t);
					if (filter.length > 0) {
						query.or(filter);
					}
				}
			}
		}
		return query.exec();
	},
	listAndPopulate(skip, size, sorter, filter, populate) {
		let by = this.schema.statics.__versioning ? {
				__latest: true,
				__closed: false
			} : {},
			query = this.find(by);
		if (Array.isArray(filter) && filter.length > 0) {
			if (by.hasOwnProperty('__latest')) {
				query.or(filter);
			} else {
				let t = {};
				while (Object.getOwnPropertyNames(t).length === 0 && filter.length > 0) {
					t = filter.pop();
				}
				if (Object.getOwnPropertyNames(t).length > 0) {
					query = this.find(t);
					if (filter.length > 0) {
						query.or(filter);
					}
				}
			}
		}
		query.sort(sorter).skip(skip).limit(size);
		populateQuery(query, populate);
		return query.exec();
	},
	add(data) {
		return routine.add(this, data);
	},
	listAll() {
		let by = (this.schema.statics.__versioning ? {
				__latest: true,
				__closed: false
			} : {}),
			query = this.find(by).sort([
				['_id', 'descending']
			]);
		return query.exec();
	},
	listAllAndPopulate(populate) {
		let by = this.schema.statics.__versioning ? {
				__latest: true,
				__closed: false
			} : {},
			query = this.find(by);
		query.sort([
			['_id', 'descending']
		]);
		populateQuery(query, populate);
		return query.exec();
	}
};

exports.methods = {
	getID: function () {
		return this.schema.statics.__incField ? this[this.schema.statics.__incField] : 0;
	},
	close() {
		this.__closed = true;
		this.save();
	}
};

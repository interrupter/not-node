const routine = require('./routine');

const notQuery = require('not-filter');

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
	makeQuery(method,filter){
		let versioningMod = {
				__latest: true,
				__closed: false
			},
			query;
		switch(notQuery.filter.getFilterType(filter)){
		case notQuery.filter.OPT_OR:
			if (this.schema.statics.__versioning){
				query = this[method]({
					$and: [versioningMod, {$or: filter}]
				});
			}else{
				query = this[method]({
					$or: filter
				});
			}
			break;
		case notQuery.filter.OPT_AND:
			if (this.schema.statics.__versioning){
				query = this[method]({
					$and: [versioningMod, filter]
				});
			}else{
				query = this[method]({
					$and:[filter]
				});
			}
			break;
		default:
			query = this[method](this.schema.statics.__versioning?versioningMod:{});
		}
		return query;
	},
	list(skip, size, sorter, filter){
		let query = this.makeQuery('find',filter);
		return query.sort(sorter).skip(skip).limit(size).exec();
	},
	countWithFilter(filter){
		let query =  this.makeQuery('count',filter);
		return query.exec();
	},
	listAndPopulate(skip, size, sorter, filter, populate) {
		let query = this.makeQuery('find', filter);
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

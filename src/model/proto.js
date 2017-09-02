const enrich = require('./enrich'),
	routine = require('./routine'),
	saveVersion = require('./versioning'),
	Schema = require('mongoose').Schema;

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

var defaultStatics = {
	sanitizeInput(input) {
		if (!input.hasOwnProperty('default')) {
			input.default = false;
		}
		return input;
	},
	getOne(id, callback) {
		let thisModel = this;
		if (thisModel.schema.statics.__versioning) {
			let query = thisModel.findOne({
				_id: id,
				__latest: true,
				__closed: false
			}).populate('__versions');
			if (callback) {
				query.exec(callback);
			} else {
				return query.exec();
			}
		} else {
			let query = thisModel.findOne({
				_id: id
			});
			if (callback) {
				query.exec(callback);
			} else {
				return query.exec();
			}
		}
	},
	getOneByID(ID, callback) {
		let thisModel = this;
		if (thisModel.schema.statics.__incField) {
			let by = (thisModel.schema.statics.__versioning ? {
					__latest: true,
					__closed: false
				} : {}),
				query;
			by[thisModel.schema.statics.__incField] = ID;
			query = thisModel.findOne(by);
			if (callback) {
				query.exec(callback);
			} else {
				return query.exec();
			}

		} else {
			callback(null, null);
		}
	},
	getOneRaw(id, callback) {
		let thisModel = this,
			query = thisModel.findOne({
				_id: id
			});
		if (callback) {
			query.exec(callback);
		} else {
			return query.exec();
		}
	},
	list(skip, size, sorter, filter, callback) {
		let thisModel = this,
			by = thisModel.schema.statics.__versioning ? {
				__latest: true,
				__closed: false
			} : {},
			query = thisModel.find(by);
		if (Array.isArray(filter) && filter.length > 0) {
			if (by.hasOwnProperty('__latest')) {
				query.or(filter);
			} else {
				let t = {};
				while (Object.getOwnPropertyNames(t).length === 0 && filter.length > 0) {
					t = filter.pop();
				}
				if (Object.getOwnPropertyNames(t).length > 0) {
					query = thisModel.find(t);
					if (filter.length > 0) {
						query.or(filter);
					}
				}
			}
		}
		if (callback) {
			query.sort(sorter).skip(skip).limit(size).exec(callback);
		} else {
			return query.sort(sorter).skip(skip).limit(size).exec();
		}
	},
	//this written in promise style
	listAndPopulate(skip, size, sorter, filter, populate) {
		let thisModel = this,
			by = thisModel.schema.statics.__versioning ? {
				__latest: true,
				__closed: false
			} : {},
			query = thisModel.find(by);
		if (Array.isArray(filter) && filter.length > 0) {
			if (by.hasOwnProperty('__latest')) {
				query.or(filter);
			} else {
				let t = {};
				while (Object.getOwnPropertyNames(t).length === 0 && filter.length > 0) {
					t = filter.pop();
				}
				if (Object.getOwnPropertyNames(t).length > 0) {
					query = thisModel.find(t);
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
	listAll(callback) {
		let thisModel = this,
			by = (thisModel.schema.statics.__versioning ? {
				__latest: true,
				__closed: false
			} : {}),
			query = thisModel.find(by).sort([
				['_id', 'descending']
			]);
		if (callback) {
			query.exec(callback);
		} else {
			return query.exec();
		}
	},
	listAllAndPopulate(populate) {
		let thisModel = this,
			by = thisModel.schema.statics.__versioning ? {
				__latest: true,
				__closed: false
			} : {},
			query = thisModel.find(by);
		query.sort([
			['_id', 'descending']
		]);
		populateQuery(query, populate);
		return query.exec();
	}
};

var defaultMethods = {
	getID: function () {
		return this.schema.statics.__incField ? this[this.schema.statics.__incField] : 0;
	},
	close() {
		this.__closed = true;
		this.save();
	}
};

exports.fabricate = function (targetModule, options, mongoose) {

	if (!options) {
		options = {
			schemaOptions: {}
		};
	} else {
		if (!options.schemaOptions) {
			options.schemaOptions = {};
		}
	}

	if (targetModule.schemaOptions) {
		options.schemaOptions = targetModule.schemaOptions;
	}

	let schema = null;
	if (targetModule.keepNotExtended) {
		schema = new Schema(targetModule.thisSchema, options.schemaOptions);
	} else {
		if (targetModule.enrich) {
			if (targetModule.enrich.validators) {
				targetModule.thisSchema = enrich.byFieldsValidators(targetModule.thisSchema, targetModule.thisModelName);
			}
			if (targetModule.enrich.versioning) {
				targetModule.thisSchema = enrich.byFieldsForVersioning(targetModule.thisSchema, targetModule.thisModelName);
			}
			if (targetModule.enrich.increment) {
				targetModule.thisSchema = enrich.byFieldsForIncrement(targetModule.thisSchema, targetModule.thisModelName);
			}
		}

		schema = new Schema(targetModule.thisSchema, options.schemaOptions);

		if (targetModule.enrich) {
			if (targetModule.enrich.increment) {
				enrich.markForIncrement(schema, targetModule.thisModelName);
			}
			if (targetModule.enrich.versioning) {
				enrich.markForVersioning(schema);
				schema.statics.saveVersion = saveVersion;
			}
		}

		if (targetModule.thisMethods) {
			for (let i in targetModule.thisMethods) {
				schema.methods[i] = targetModule.thisMethods[i];
			}
		}

		if (targetModule.thisStatics) {
			for (let j in targetModule.thisStatics) {
				schema.statics[j] = targetModule.thisStatics[j];
			}
		}

		if (targetModule.thisVirtuals) {
			for (let j in targetModule.thisVirtuals) {
				if (typeof targetModule.thisVirtuals[j].get === 'function' && typeof targetModule.thisVirtuals[j].set === 'function') {
					schema.virtual(j).get(targetModule.thisVirtuals[j].get).set(targetModule.thisVirtuals[j].set);
				} else {
					schema.virtual(j, targetModule.thisVirtuals[j]);
				}
			}
		}

		for (let st in defaultStatics) {
			if (!schema.statics.hasOwnProperty(st)) {
				schema.statics[st] = defaultStatics[st];
			}
		}

		for (let st in defaultMethods) {
			if (!schema.methods.hasOwnProperty(st)) {
				schema.methods[st] = defaultMethods[st];
			}
		}
	}
	targetModule.mongooseSchema = schema;
	try {
		targetModule[targetModule.thisModelName] = mongoose.model(targetModule.thisModelName);
	} catch (error) {
		targetModule[targetModule.thisModelName] = mongoose.model(targetModule.thisModelName, schema);
	}
};

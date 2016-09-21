const enrich = require('./enrich'),
	routine = require('./routine'),
	saveVersion = require('./versioning'),
	Schema = require('mongoose').Schema;

exports.extractVariants = function(items) {
	var variants = [];
	if(items && items.length) {
		for(var i = 0; i < items.length; i++) {
			variants.push(items[i].getVariant());
		}
	}
	return variants;
};

var defaultStatics = {
	sanitizeInput(input) {
		if(!input.hasOwnProperty('default')) {
			input.default = false;
		}
		return input;
	},
	getOne(id, callback) {
		var thisModel = this;
		if (thisModel.schema.statics.__versioning){
			thisModel.findOne({
				_id: id
			}).populate('__versions').exec(callback);
		}else{
			thisModel.findOne({
				_id: id
			}).exec(callback);
		}
	},
	getOneByID(ID, callback) {
		var thisModel = this;
		if(thisModel.schema.statics.__incField) {
			var query = {
				__latest: true
			};
			query[thisModel.schema.statics.__incField] = ID;
			thisModel.findOne(query).exec(callback);
		} else {
			callback(null, null);
		}
	},
	getOneRaw(id, callback) {
		var thisModel = this;
		thisModel.findOne({
			_id: id
		}).exec(callback);
	},
	list(skip, size, sorter, filter, callback) {
		var thisModel = this;
		var query = thisModel.find({
			__latest: true
		}).sort(sorter);
		if(filter.length > 0) {
			query.or(filter);
		}
		query.skip(skip).limit(size).exec(callback);
	},
	addNew(data, callbackOK, callbackError) {
		routine.add(this, data, callbackOK, callbackError);
	},
	listAll(callback) {
		var thisModel = this;
		thisModel.find({
			__latest: true
		}).sort([
			['_id', 'descending']
		]).exec(callback);
	}
};

var defaultMethods = {
	getID: function(){
		return this.schema.statics.__incField?this[this.schema.statics.__incField]:0;
	}
};

exports.fabricate = function(targetModule, options, mongoose) {
	if (!targetModule.hasOwnProperty('exports')){
		targetModule = {
			exports: targetModule
		};
	}

	if(!options) {
		options = {
			schemaOptions: {}
		};
	} else {
		if(!options.schemaOptions) {
			options.schemaOptions = {};
		}
	}
	var schema = null;
	if (targetModule.exports.keepNotExtended){
		schema = new Schema(targetModule.exports.thisSchema, options.schemaOptions);
	}else{
		if (targetModule.exports.enrich){
			if (targetModule.exports.enrich.validators){
				targetModule.exports.thisSchema = enrich.byFieldsValidators(targetModule.exports.thisSchema, targetModule.exports.thisModelName);
			}
			if (targetModule.exports.enrich.versioning){
				targetModule.exports.thisSchema = enrich.byFieldsForVersioning(targetModule.exports.thisSchema, targetModule.exports.thisModelName);
			}
			if (targetModule.exports.enrich.increment){
				targetModule.exports.thisSchema = enrich.byFieldsForIncrement(targetModule.exports.thisSchema, targetModule.exports.thisModelName);
			}
		}

		schema = new Schema(targetModule.exports.thisSchema, options.schemaOptions);

		if (targetModule.exports.enrich){
			if (targetModule.exports.enrich.increment){
				enrich.markForIncrement(schema, targetModule.exports.thisModelName);
			}
			if (targetModule.exports.enrich.versioning){
				enrich.markForVersioning(schema);
				schema.statics.saveVersion = saveVersion;
			}
		}

		if(targetModule.exports.thisMethods) {
			for(let i in targetModule.exports.thisMethods) {
				schema.methods[i] = targetModule.exports.thisMethods[i];
			}
		}

		if(targetModule.exports.thisStatics) {
			for(let j in targetModule.exports.thisStatics) {
				schema.statics[j] = targetModule.exports.thisStatics[j];
			}
		}

		for(let st in defaultStatics){
			if (!schema.statics.hasOwnProperty(st)){
				schema.statics[st] = defaultStatics[st];
			}
		}

		for(let st in defaultMethods){
			if (!schema.methods.hasOwnProperty(st)){
				schema.methods[st] = defaultMethods[st];
			}
		}
	}

	targetModule.exports[targetModule.exports.thisModelName] = mongoose.model(targetModule.exports.thisModelName, schema);
	targetModule.exports.mongooseSchema = schema;
};

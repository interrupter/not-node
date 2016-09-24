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
	/*if (!targetModule.hasOwnProperty('exports')){
		targetModule = {
			exports: targetModule
		};
	}*/

	if(!options) {
		options = {
			schemaOptions: {}
		};
	} else {
		if(!options.schemaOptions) {
			options.schemaOptions = {};
		}
	}

	if (targetModule.schemaOptions){
		options.schemaOptions = targetModule.schemaOptions;
	}

	var schema = null;
	if (targetModule.keepNotExtended){
		schema = new Schema(targetModule.thisSchema, options.schemaOptions);
	}else{
		if (targetModule.enrich){
			if (targetModule.enrich.validators){
				targetModule.thisSchema = enrich.byFieldsValidators(targetModule.thisSchema, targetModule.thisModelName);
			}
			if (targetModule.enrich.versioning){
				targetModule.thisSchema = enrich.byFieldsForVersioning(targetModule.thisSchema, targetModule.thisModelName);
			}
			if (targetModule.enrich.increment){
				targetModule.thisSchema = enrich.byFieldsForIncrement(targetModule.thisSchema, targetModule.thisModelName);
			}
		}

		schema = new Schema(targetModule.thisSchema, options.schemaOptions);

		if (targetModule.enrich){
			if (targetModule.enrich.increment){
				enrich.markForIncrement(schema, targetModule.thisModelName);
			}
			if (targetModule.enrich.versioning){
				enrich.markForVersioning(schema);
				schema.statics.saveVersion = saveVersion;
			}
		}

		if(targetModule.thisMethods) {
			for(let i in targetModule.thisMethods) {
				schema.methods[i] = targetModule.thisMethods[i];
			}
		}

		if(targetModule.thisStatics) {
			for(let j in targetModule.thisStatics) {
				schema.statics[j] = targetModule.thisStatics[j];
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

	targetModule[targetModule.thisModelName] = mongoose.model(targetModule.thisModelName, schema);
	targetModule.mongooseSchema = schema;
};

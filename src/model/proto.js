const enrich = require('./enrich'),
	saveVersion = require('./versioning'),
	Schema = require('mongoose').Schema,
	defaultModel= require('./default');

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

		for (let st in defaultModel.statics) {
			if (!schema.statics.hasOwnProperty(st)) {
				schema.statics[st] = defaultModel.statics[st];
			}
		}

		for (let st in defaultModel.methods) {
			if (!schema.methods.hasOwnProperty(st)) {
				schema.methods[st] = defaultModel.methods[st];
			}
		}

		for (let st in defaultModel.virtuals) {
			if (!schema.virtuals.hasOwnProperty(st)) {
				schema.virtuals[st] = defaultModel.virtuals[st];
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

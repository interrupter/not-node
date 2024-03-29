/** @module Model/Proto */

const enrich = require("./enrich"),
    saveVersion = require("./versioning").version,
    { Schema } = require("mongoose"),
    defaultModel = require("./default"),
    log = require("not-log")(module, "ModelProto");

module.exports = class ModelFabricate {
    static isIgnored(targetModule) {
        return targetModule.IGNORE;
    }

    static initOptions(options, targetModule) {
        if (!options) {
            options = {
                schemaOptions: {},
            };
        } else {
            if (!options.schemaOptions) {
                options.schemaOptions = {};
            }
        }
        if (targetModule.schemaOptions) {
            options = {
                ...options,
                schemaOptions: targetModule.schemaOptions,
            };
        }
        if (targetModule.options) {
            options = {
                ...options,
                ...targetModule.options,
            };
        }
        return options;
    }

    static isNotExtendable(targetModule) {
        return targetModule.keepNotExtended;
    }

    static extendSchemaFrom(src, dest) {
        if (src) {
            for (let j in src) {
                if (
                    typeof src[j].get === "function" &&
                    typeof src[j].set === "function"
                ) {
                    dest(j).get(src[j].get).set(src[j].set);
                } else {
                    dest(j, src[j]);
                }
            }
        }
    }

    static extendBySource(schema, targetModule) {
        if (targetModule.thisMethods) {
            Object.assign(schema.methods, targetModule.thisMethods);
        }

        if (targetModule.thisStatics) {
            Object.assign(schema.statics, targetModule.thisStatics);
        }
        this.extendSchemaFrom(
            targetModule.thisVirtuals,
            schema.virtual.bind(schema)
        );
        this.extendSchemaFrom(targetModule.thisPre, schema.pre.bind(schema));
        this.extendSchemaFrom(targetModule.thisPost, schema.post.bind(schema));
    }

    static enrichByFields(targetModule, options) {
        if (targetModule.enrich) {
            if (targetModule.enrich.validators) {
                targetModule.thisSchema = enrich.byFieldsValidators(
                    targetModule.thisSchema,
                    options
                );
            }
            if (targetModule.enrich.versioning) {
                targetModule.thisSchema = enrich.byFieldsForVersioning(
                    targetModule.thisSchema,
                    targetModule.thisModelName
                );
            }
            if (targetModule.enrich.increment) {
                targetModule.thisSchema = enrich.byFieldsForIncrement(
                    targetModule.thisSchema,
                    targetModule.thisModelName
                );
            }
        }
    }

    static collectFieldsForIndexes(targetModule) {
        let fieldsForIndexes = [];
        for (let fieldName in targetModule.thisSchema) {
            let field = targetModule.thisSchema[fieldName];
            if (field.unique) {
                fieldsForIndexes.push(fieldName);
                field.unique = false;
            }
        }
        return fieldsForIndexes;
    }

    static createIndexesForFields(schema, fieldsForIndexes) {
        for (let fieldName of fieldsForIndexes) {
            let rule = { __closed: 1, __latest: 1, _id: 1 };
            rule[fieldName] = 1;
            schema.index(rule, { unique: true });
        }
    }

    static createIndexesForText(schema, targetModule) {
        if (targetModule.enrich && targetModule.enrich.textIndex) {
            schema.index(targetModule.enrich.textIndex, {
                name: Object.keys(targetModule.enrich.textIndex).join("__"),
            });
        }
    }

    static markFor(schema, targetModule) {
        if (targetModule.enrich) {
            if (targetModule.enrich.increment) {
                if (
                    Object.prototype.hasOwnProperty.call(
                        targetModule.enrich,
                        "incrementOptions"
                    )
                ) {
                    enrich.markForIncrement(
                        schema,
                        targetModule.thisModelName,
                        targetModule.enrich.incrementOptions
                    );
                } else {
                    enrich.markForIncrement(schema, targetModule.thisModelName);
                }
            }
            if (targetModule.enrich.versioning) {
                enrich.markForVersioning(schema);
                schema.statics.saveVersion = saveVersion;
            }
        }
    }

    static extendSchema(targetModule, options) {
        if (ModelFabricate.isNotExtendable(targetModule)) {
            return new Schema(targetModule.thisSchema, options.schemaOptions);
        } else {
            ModelFabricate.enrichByFields(targetModule, options);
            //collecting information of unique fields, removing unique flag from schema
            let fieldsForIndexes =
                ModelFabricate.collectFieldsForIndexes(targetModule);
            //creating schema for model
            let schema = new Schema(
                targetModule.thisSchema,
                options.schemaOptions
            );
            if (schema) {
                //creating unique indexes
                ModelFabricate.createIndexesForFields(schema, fieldsForIndexes);
                ModelFabricate.createIndexesForText(schema, targetModule);
                //adding specific fields and identificators
                ModelFabricate.markFor(schema, targetModule);
                //extending schema methods, statics, virtuals by user defined and default content
                ModelFabricate.extendBySource(schema, targetModule);
                ModelFabricate.extendBySource(schema, defaultModel);
                return schema;
            } else {
                return false;
            }
        }
    }

    static initMongooseModel(targetModule, schema, mongoose) {
        if (mongoose.modelNames().indexOf(targetModule.thisModelName) === -1) {
            targetModule[targetModule.thisModelName] = mongoose.model(
                targetModule.thisModelName,
                schema
            );
        } else {
            targetModule[targetModule.thisModelName] =
                mongoose.connection.model(targetModule.thisModelName);
        }
        targetModule[targetModule.thisModelName].createIndexes();
    }

    static fabricate(targetModule, options, mongoose) {
        if (ModelFabricate.isIgnored(targetModule)) {
            return;
        }
        options = ModelFabricate.initOptions(options, targetModule);
        const schema = ModelFabricate.extendSchema(targetModule, options);
        if (schema) {
            targetModule.mongooseSchema = schema;
            try {
                ModelFabricate.initMongooseModel(
                    targetModule,
                    schema,
                    mongoose
                );
            } catch (error) {
                log && log.error(error);
            }
        }
    }
};

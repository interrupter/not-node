const expect = require("chai").expect,
    increment = require("../../src/model/increment"),
    validators = require("./../validators"),
    remember = require("./../remember"),
    proto = require("../../src/model/proto"),
    defaultModel = require("../../src/model/default");

module.exports = ({ mongod, mongoose }) => {
    describe("Model/Proto", function () {
        before(async () => {
            increment.init(mongoose);
        });

        describe("isIgnored", () => {
            it("set to TRUE", () => {
                let targetModule = {
                        IGNORE: true,
                    },
                    result = proto.isIgnored(targetModule);
                expect(result).to.be.true;
            });

            it("set to TRUE", () => {
                let targetModule = {
                        IGNORE: false,
                    },
                    result = proto.isIgnored(targetModule);
                expect(result).to.be.false;
            });
        });

        describe("initOptions", () => {
            it("targetModule.schemaOptions is set, but options is NULL", () => {
                let targetModule = {
                        schemaOptions: {
                            foor: "bar",
                        },
                    },
                    result = proto.initOptions(null, targetModule);
                expect(result.schemaOptions).to.exist;
                expect(result.schemaOptions.foor).to.be.equal("bar");
            });

            it("targetModule.schemaOptions is set, but options is NULL", () => {
                let targetModule = {
                        schemaOptions: {
                            foor: "bar",
                        },
                    },
                    options = {
                        schemaOptions: {
                            legacy: "instruction",
                        },
                    },
                    result = proto.initOptions(options, targetModule);
                expect(result.schemaOptions).to.exist;
                expect(result.schemaOptions.foor).to.be.equal("bar");
            });
        });

        describe("extendBySource", () => {
            it("targetModule full", () => {
                let schema = {
                    methods: {
                        secure() {},
                    },
                    statics: {
                        insecure() {},
                    },
                    virtual(l) {
                        expect(l).to.be.equal("neo");
                        return {
                            get() {
                                return {
                                    set() {},
                                };
                            },
                        };
                    },
                    pre(key, l) {
                        expect(key).to.be.equal("update");
                        expect(l(2)).to.be.equal(4);
                    },
                    post(key, l) {
                        expect(key).to.be.equal("update");
                        expect(l(2)).to.be.equal(1);
                    },
                };
                let targetModule = {
                    thisMethods: {
                        foo() {},
                    },
                    thisStatics: {
                        bar() {},
                    },
                    thisVirtuals: {
                        neo: {
                            get() {},
                            set() {},
                        },
                    },
                    thisPre: {
                        update(n) {
                            return n * 2;
                        },
                    },
                    thisPost: {
                        update(n) {
                            return n / 2;
                        },
                    },
                };
                proto.extendBySource(schema, targetModule);
                expect(schema.methods).to.have.keys(["secure", "foo"]);
                expect(schema.statics).to.have.keys(["insecure", "bar"]);
            });

            it("targetModule not full, different structure of virtuals", () => {
                let schema = {
                    methods: {
                        secure() {},
                    },
                    statics: {
                        insecure() {},
                    },
                    virtual(l) {
                        expect(l).to.be.equal("neo");
                    },
                    pre(key, l) {
                        expect(key).to.be.equal("update");
                        expect(l(2)).to.be.equal(4);
                    },
                    post(key, l) {
                        expect(key).to.be.equal("update");
                        expect(l(2)).to.be.equal(1);
                    },
                };
                let targetModule = {
                    thisVirtuals: {
                        neo() {},
                    },
                    thisPre: {
                        update(n) {
                            return n * 2;
                        },
                    },
                    thisPost: {
                        update(n) {
                            return n / 2;
                        },
                    },
                };
                proto.extendBySource(schema, targetModule);
                expect(schema.methods).to.have.keys(["secure"]);
                expect(schema.statics).to.have.keys(["insecure"]);
            });
        });

        describe("enrichByFields", () => {
            it("enrich not exist", () => {
                let targetModule = {};
                proto.enrichByFields(targetModule);
                expect(targetModule).to.be.deep.equal({});
            });

            it("enrich not filled", () => {
                let targetModule = {
                    enrich: {},
                };
                proto.enrichByFields(targetModule);
                expect(targetModule).to.be.deep.equal({
                    enrich: {},
                });
            });
        });

        describe("collectFieldsForIndexes", () => {
            it("targetModule have unique fields for indexes", () => {
                const mod = {
                    thisSchema: {
                        name: {
                            unique: true,
                        },
                        ID: {
                            unique: true,
                        },
                        phone: {},
                    },
                };
                const result = proto.collectFieldsForIndexes(mod);
                expect(result.sort()).to.be.deep.equal(["name", "ID"].sort());
            });
        });
        //createIndexesForFields
        describe("createIndexesForFields", () => {
            it("schema is not empty; fieldsForIndex not empty", () => {
                const schema = {
                        index(rule, opts) {
                            expect(opts).to.be.deep.equal({
                                unique: true,
                            });
                            expect(rule).to.include({
                                __closed: 1,
                                __latest: 1,
                                _id: 1,
                            });
                        },
                    },
                    fieldsForIndexes = ["name", "ID"];
                proto.createIndexesForFields(schema, fieldsForIndexes);
            });
        });

        describe("createIndexesForText", () => {
            it("textIndex exists", () => {
                const targetModule = {
                        enrich: {
                            textIndex: {
                                name: 1,
                                surname: 1,
                            },
                        },
                    },
                    schema = {
                        index(rule, opts) {
                            expect(rule).to.be.deep.equal(
                                targetModule.enrich.textIndex
                            );
                            expect(opts).to.be.deep.equal({
                                name: "name__surname",
                            });
                        },
                    };
                proto.createIndexesForText(schema, targetModule);
            });
        });

        describe("markFor", () => {
            it("!enrich", () => {
                proto.markFor({}, {});
            });

            it("enrich, !enrich.increment, !enrich.versioning", () => {
                proto.markFor(
                    {},
                    {
                        enrich: {},
                    }
                );
            });

            it("enrich, enrich.increment && enrich.incrementOptions, !enrich.versioning", () => {
                proto.markFor(
                    {
                        statics: {},
                    },
                    {
                        thisModelName: "ModelName",
                        enrich: {
                            increment: {},
                            incrementOptions: {},
                        },
                    }
                );
            });
        });

        describe("initMongooseModel", () => {
            it("model already created and presented in mongoose", () => {
                let results = {};
                const schema = {
                        name: {
                            type: "string",
                        },
                    },
                    mongoose = {
                        modelNames() {
                            results.modelNames = true;
                            return ["SameModelName"];
                        },
                        connection: {
                            model() {
                                return {
                                    createIndexes() {
                                        results.createIndexes = true;
                                    },
                                };
                            },
                        },
                    },
                    targetModule = {
                        thisModelName: "SameModelName",
                    };
                proto.initMongooseModel(targetModule, schema, mongoose);
                expect(results).to.have.keys(["modelNames", "createIndexes"]);
            });
        });

        it("fabricate with options", function () {
            let moduleProto1 = {
                thisSchema: {
                    name: {
                        type: String,
                        required: true,
                        validate: validators.title,
                    },
                    default: {
                        type: Boolean,
                        required: true,
                    },
                },
                thisModelName: "User1",
                thisMethods: {
                    getName: function () {
                        return this.name + " 1";
                    },
                },
                thisStatics: {
                    returnFalse: () => false,
                },
                enrich: {
                    versioning: true,
                    increment: true,
                    validators: true,
                },
            };
            proto.fabricate(moduleProto1, {}, mongoose);
            expect(moduleProto1.User1).to.exist;
            expect(moduleProto1.User1.returnFalse()).to.be.false;
            let item = new moduleProto1.User1({
                name: "val",
            });
            expect(item.getName()).to.be.equal("val 1");
            expect(moduleProto1.mongooseSchema.statics).to.have.keys([
                "saveVersion",
                "__versioning",
                "__incModel",
                "__incField",
                "returnFalse",
                "sanitizeInput",
                "getOne",
                "getOneByID",
                "getOneRaw",
                "makeQuery",
                "list",
                "countWithFilter",
                "listAndPopulate",
                "add",
                "update",
                "listAll",
                "listAllAndPopulate",
                "listAndCount",
                "listByField",
            ]);
            expect(moduleProto1.mongooseSchema.methods).to.have.keys([
                "getName",
                "getID",
                "close",
                "saveNewVersion",
            ]);
        });

        let moduleProto = {
            thisSchema: {
                username: {
                    type: String,
                    required: true,
                    validate: validators.title,
                },
                default: {
                    type: Boolean,
                    required: true,
                },
            },
            thisModelName: "User",
            thisMethods: {},
            thisStatics: {},
            enrich: {
                versioning: true,
                increment: true,
                validators: true,
            },
        };

        it("fabricate without options", function () {
            proto.fabricate(moduleProto, null, mongoose);
            expect(moduleProto.User).to.exist;
        });

        require("./default.js")({
            expect,
            mongoose,
            mongod,
            defaultModel,
            moduleProto,
            remember,
        });
    });
};

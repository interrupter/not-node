const path = require("path");
const notModuleRegistratorFields = require("../../src/manifest/registrator/fields");

module.exports = ({ expect }) => {
    describe("notModuleRegistratorFields", () => {
        describe("getPath", () => {
            it("module paths(fields)", function () {
                const testPath = "path_to_fields";
                const ctx = {
                    module: {
                        paths: {
                            fields: testPath,
                        },
                    },
                };
                const pathTo = notModuleRegistratorFields.getPath(ctx);
                expect(pathTo).to.be.equal(testPath);
            });
        });

        describe("run", function () {
            it("path to fields is not defined", function () {
                const ctx = {};
                const param = {
                    nModule: {
                        module: {
                            paths: {},
                        },
                    },
                };
                const res = notModuleRegistratorFields.run.call(ctx, param);
                expect(res).to.be.false;
            });

            it("paths to fields is defined", function () {
                const ctx = {
                    findAll() {},
                    extendByFrontValidators() {},
                };
                const param = {
                    nModule: {
                        module: {
                            paths: {
                                fields: "some fields",
                            },
                        },
                    },
                };
                const res = notModuleRegistratorFields.run.call(ctx, param);
                expect(res).to.be.true;
            });
        });

        it("findAll", function () {
            const logicsPath = path.join(__dirname, "../testies/module/fields");
            const list = [
                path.resolve(
                    __dirname,
                    "../testies/module/fields/collection.js"
                ),
                path.resolve(__dirname, "../testies/module/fields/single.js"),
            ].sort();
            let result = [];
            const ctx = {
                register({ fromPath }) {
                    result.push(fromPath);
                },
            };
            const param = {
                nModule: {},
                srcDir: logicsPath,
            };
            notModuleRegistratorFields.findAll.call(ctx, param);
            result.sort();
            expect(result).to.be.deep.equal(list);
        });

        describe("register", function () {
            it("file is lib", (done) => {
                const libPath = path.resolve(
                    __dirname,
                    "../testies/module/fields/collection.js"
                );
                const ctx = {
                    registerFields({ lib, fromPath, nModule }) {
                        expect(fromPath).to.be.deep.equal(libPath);
                        expect(nModule.fieldsImportRules).to.be.deep.equal({
                            one: true,
                        });
                        expect(lib).to.be.have.keys(["collectionItem"]);
                        done();
                    },
                };
                const param = {
                    nModule: {
                        fieldsImportRules: {
                            one: true,
                        },
                    },
                    fromPath: libPath,
                };
                notModuleRegistratorFields.register.call(ctx, param);
            });

            it("file is single field", (done) => {
                const ctx = {
                    registerField({ name, field, nModule }) {
                        expect(nModule.fieldsImportRules).to.be.deep.equal({
                            one: true,
                        });
                        expect(field).to.be.have.keys(["ui", "model"]);
                        expect(name).to.be.equal("single");
                        done();
                    },
                };
                const param = {
                    nModule: {
                        fieldsImportRules: {
                            one: true,
                        },
                    },
                    fromPath: path.resolve(
                        __dirname,
                        "../testies/module/fields/single.js"
                    ),
                };
                notModuleRegistratorFields.register.call(ctx, param);
            });
        });

        describe("registerFields", function () {
            it("file is a lib", () => {
                const fField = {
                    ui: {
                        component: "UITextfield",
                        placeholder: "collectionItem",
                        label: "collectionItem",
                        readonly: true,
                    },
                    model: {
                        type: String,
                        searchable: true,
                        required: true,
                    },
                };
                const ctx = {
                    registerField({ name, field }) {
                        expect(name).to.be.equal("collectionItem");
                        expect(field).to.be.deep.equal(fField);
                    },
                };
                const param = {
                    fieldsImportRules: {},
                    lib: require(path.resolve(
                        __dirname,
                        "../testies/module/fields/collection.js"
                    )).FIELDS,
                };
                notModuleRegistratorFields.registerFields.call(ctx, param);
            });
        });

        describe("registerField", function () {
            it("file is a single field", () => {
                const fPath = path.resolve(
                    __dirname,
                    "../testies/module/fields/single.js"
                );
                let FIELDS = {};
                const ctx = {
                    extendByFrontValidators() {},
                    registerFieldIfInsecure() {},
                };
                const param = {
                    name: "single",
                    field: require(fPath),
                    fromPath: fPath,
                    nModule: {
                        setField(name, val) {
                            FIELDS[name] = val;
                        },
                        getName() {
                            return "test_module";
                        },
                    },
                };
                notModuleRegistratorFields.registerField.call(ctx, param);
                expect(Object.keys(FIELDS).includes("single")).to.be.true;
            });
        });
    });
};

const expect = require("chai").expect,
    increment = require("../../src/model/increment");

module.exports = ({ mongod, mongoose }) => {
    describe("Increment", function () {
        describe("notContainedInData", () => {
            it("fields empty, object not empty", () => {
                const fields = [];
                const obj = {
                    meat: 1,
                };
                const res = increment.notContainedInData(fields, obj);
                expect(res).to.be.instanceof(Array);
                expect(res).to.be.deep.equal([]);
            });

            it("fields empty, object empty", () => {
                const fields = [];
                const obj = {};
                const res = increment.notContainedInData(fields, obj);
                expect(res).to.be.instanceof(Array);
                expect(res).to.be.deep.equal([]);
            });

            it("fields not empty, object contains em all", () => {
                const fields = ["meat", "laser"];
                const obj = {
                    meat: 1,
                    laser: 3,
                    lepricon: true,
                };
                const res = increment.notContainedInData(fields, obj);
                expect(res).to.be.instanceof(Array);
                expect(res).to.be.deep.equal([]);
            });

            it("fields not empty, object contains none", () => {
                const fields = ["meat", "laser"];
                const obj = {
                    meat1: 1,
                    laser1: 3,
                    lepricon1: true,
                };
                const res = increment.notContainedInData(fields, obj);
                expect(res).to.be.instanceof(Array);
                expect(res.sort()).to.be.deep.equal(["meat", "laser"].sort());
            });
        });

        describe("formId", () => {
            it("modelName - not empty, filterFields - empty, data - empty", () => {
                const modelName = "user",
                    filterFields = [],
                    data = {};
                const res = increment.formId(modelName, filterFields, data);
                expect(typeof res).to.be.equal("string");
                expect(res).to.be.deep.equal(modelName);
            });

            it("modelName - not empty, filterFields - one field, data - contains fields", () => {
                const modelName = "user",
                    filterFields = ["group"],
                    data = {
                        group: 1,
                        name: "lego",
                    };
                const res = increment.formId(modelName, filterFields, data);
                expect(typeof res).to.be.equal("string");
                expect(res).to.be.deep.equal(`${modelName}_${data.group}`);
            });

            it("modelName - not empty, filterFields - two fields, data - contains fields", () => {
                const modelName = "user",
                    filterFields = ["group", "long"],
                    data = {
                        group: 1,
                        long: true,
                        name: "lego",
                    };
                const res = increment.formId(modelName, filterFields, data);
                expect(typeof res).to.be.equal("string");
                expect(res).to.be.deep.equal(`${modelName}_${data.group}_true`);
            });

            it("modelName - not empty, filterFields - two fields, data - contains none", () => {
                const modelName = "user",
                    filterFields = ["group", "long"],
                    data = {
                        name: "lego",
                    };
                try {
                    increment.formId(modelName, filterFields, data);
                    expect(true).to.be.false;
                } catch (e) {
                    expect(e).to.be.instanceof(Error);
                }
            });
        });
        //
        describe("secureUpdate", () => {
            it("updateOne", async () => {
                const thisM = {
                        updateOne(...params) {
                            return {
                                async exec() {
                                    return params.join(".");
                                },
                            };
                        },
                    },
                    which = 1,
                    cmd = 2,
                    opts = 3;
                expect(
                    await increment.secureUpdate(thisM, which, cmd, opts).exec()
                ).to.be.equal("1.2.3");
            });

            it("update", async () => {
                const thisM = {
                        update(...params) {
                            return {
                                async exec() {
                                    return params.join(".");
                                },
                            };
                        },
                    },
                    which = 1,
                    cmd = 2,
                    opts = 3;
                expect(
                    await increment.secureUpdate(thisM, which, cmd, opts).exec()
                ).to.be.equal("1.2.3");
            });
        });

        describe("init", () => {
            it("before init", function () {
                expect(increment.next).to.not.exist;
                expect(increment.model).to.not.exist;
            });

            it("after init", function () {
                increment.init(mongoose);
                expect(increment.next).to.exist;
                expect(increment.model).to.exist;
            });

            it("second time", function () {
                increment.init(mongoose);
                expect(increment.next).to.exist;
                expect(increment.model).to.exist;
            });
        });

        describe("getNext", () => {
            it("first time", async () => {
                const nextID = await increment.next("modelName");
                expect(nextID).to.deep.equal(1);
            });

            it("second time", async () => {
                const nextID = await increment.next("modelName");
                expect(nextID).to.deep.equal(2);
            });

            it("with error", async () => {
                try {
                    await increment.next({
                        some: 1,
                        object: 2,
                    });
                    expect(true).to.be.false;
                } catch (err) {
                    expect(err).to.exist;
                    expect(err).to.be.instanceof(Error);
                }
            });

            it("sequence with filterFields for different groups", async () => {
                let nextID;
                nextID = await increment.next("uberModelName", ["carrot"], {
                    carrot: 2,
                });
                expect(nextID).to.deep.equal(1);
                nextID = await increment.next("uberModelName", ["carrot"], {
                    carrot: 3,
                });
                expect(nextID).to.deep.equal(1);
                nextID = await increment.next("uberModelName", ["carrot"], {
                    carrot: 2,
                });
                expect(nextID).to.deep.equal(2);
                nextID = await increment.next("uberModelName", ["carrot"], {
                    carrot: 3,
                });
                expect(nextID).to.deep.equal(2);
                nextID = await increment.next("uberModelName", ["carrot"], {
                    carrot: 5,
                });
                expect(nextID).to.deep.equal(1);
            });

            it("missing fields, throw out", async () => {
                try {
                    await increment.next("uberModelName", ["carrot"], {});
                    throw "no error";
                } catch (e) {
                    expect(e).to.be.instanceof(Error);
                }
            });
        });

        describe("newRebase", () => {
            it("doing cold start rebase", async () => {
                let nextID = await increment.rebase(
                    "rebasedModelName_true",
                    10
                );
                expect(nextID).to.deep.equal(10);
                nextID = await increment.next("rebasedModelName", ["carrot"], {
                    carrot: true,
                });
                expect(nextID).to.deep.equal(11);
                nextID = await increment.next("rebasedModelName", ["carrot"], {
                    carrot: true,
                });
                expect(nextID).to.deep.equal(12);
                nextID = await increment.rebase("rebasedModelName_true", 10);
                expect(nextID).to.deep.equal(10);
                nextID = await increment.next("rebasedModelName", ["carrot"], {
                    carrot: true,
                });
                expect(nextID).to.deep.equal(11);
            });
        });
    });
};

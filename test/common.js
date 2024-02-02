const expect = require("chai").expect,
    mongoose = require("mongoose"),
    path = require("path"),
    ObjectId = mongoose.Types.ObjectId,
    Common = require("../src/common");

describe("Common", function () {
    describe("firstLetterToLower", function () {
        it("`Some error` -> `some error`", function () {
            expect(Common.firstLetterToLower("Some error")).to.be.equal(
                "some error"
            );
        });
    });

    describe("firstLetterToUpper", function () {
        it("`some error` -> `Some error`", function () {
            expect(Common.firstLetterToUpper("some error")).to.be.equal(
                "Some error"
            );
        });
    });

    let testie = "Иероним Босх";
    describe(`validateObjectId, build in validator not failed on ${testie}`, function () {
        it(`Mongoose.Types.ObjectId.isValid('${testie}') -> true`, function () {
            expect(ObjectId.isValid(testie)).to.be.not.ok;
        });

        it(`validateObjectId(${testie}) -> false`, function () {
            expect(Common.validateObjectId(testie)).to.be.not.ok;
        });

        it("validateObjectId(`5af96abbce4adb46c5202ed3`) -> true", function () {
            expect(Common.validateObjectId("5af96abbce4adb46c5202ed3")).to.be
                .ok;
        });

        it("validateObjectId(undefined) -> false", function () {
            expect(Common.validateObjectId(undefined)).to.be.false;
        });
    });

    describe("compareObjectIds", function () {
        it("null and null -> false", function () {
            expect(Common.compareObjectIds(null, null)).to.be.false;
        });
        it("1 and 1 -> false", function () {
            expect(Common.compareObjectIds(1, 1)).to.be.false;
        });
        it('"1" and 1 -> false', function () {
            expect(Common.compareObjectIds("1", 1)).to.be.false;
        });
    });

    describe("getTodayDate", () => {
        it("today", () => {
            const res = Common.getTodayDate();
            expect(typeof res).to.be.equal("number");
        });
    });
    //
    describe("executeObjectFunction", () => {
        it("promise", async () => {
            const obj = {
                    async method(...params) {
                        return "apple " + params.join(".");
                    },
                },
                name = "method",
                params = [1, 2, 3, true];
            const res = await Common.executeObjectFunction(obj, name, params);
            expect(res).to.be.equal("apple 1.2.3.true");
        });

        it("function", async () => {
            const obj = {
                    method(...params) {
                        return "apple " + params.join(".");
                    },
                },
                name = "method",
                params = [1, 2, 3, true];
            const res = await Common.executeObjectFunction(obj, name, params);
            expect(res).to.be.equal("apple 1.2.3.true");
        });

        it("!obj", async () => {
            const obj = null,
                name = "method",
                params = [1, 2, 3, true];
            const res = await Common.executeObjectFunction(obj, name, params);
            expect(res).to.be.undefined;
        });
    });

    describe("mapBind", function () {
        it("to is undefined, exception throwned", function (done) {
            let to = undefined;
            try {
                Common.mapBind({ getModel() {} }, to, ["getModel"]);
                console.log(to);
                done(new Error("should throw"));
            } catch (e) {
                expect(e).to.be.instanceof(Error);
                done();
            }
        });

        it("list is empty", function () {
            const to = {};
            Common.mapBind({}, to, []);
            expect(to).to.be.deep.equal({});
        });

        it("list item is not pointing to function", function () {
            const to = {};
            Common.mapBind({}, to, ["vasqa de gamma"]);
            expect(to).to.be.deep.equal({});
        });
    });

    describe("tryFile", function () {
        const pathToExistingFile = path.join(
            __dirname,
            "testies/module/fields/collection.js"
        );
        const pathToAbsentFile = path.join(
            __dirname,
            "testies/module/fields/collection.ejs"
        );
        const pathToDirectory = path.join(
            __dirname,
            "testies/module/fields/empty"
        );

        it("file exists, type file", function () {
            const res = Common.tryFile(pathToExistingFile);
            expect(res).to.be.equal(true);
        });

        it("file doesnt exist", function () {
            const res = Common.tryFile(pathToAbsentFile);
            expect(res).to.be.equal(false);
        });

        it("directory", function () {
            const res = Common.tryFile(pathToDirectory);
            expect(res).to.be.equal(false);
        });
    });

    describe("copyObj", function () {
        it("empty", function () {
            let rule = {};
            expect(Common.copyObj(rule)).to.be.deep.equal({});
        });

        it("not empty, then modification of new rule is not changes original", function () {
            let rule = { some: ["data"] };
            let copyOfRule = Common.copyObj(rule);
            delete copyOfRule.some;
            expect(rule).to.be.deep.equal({ some: ["data"] });
        });
    });

    describe("objHas", () => {
        it("one field, exists", () => {
            const obj = { field: 1 };
            expect(Common.objHas(obj, "field")).to.be.true;
        });

        it("one field, dont exists", () => {
            const obj = { field: 1 };
            expect(Common.objHas(obj, "field2")).to.be.false;
        });

        it("few fields, one dont exists", () => {
            const obj = { field: 1, goo: true, joe: "foo" };
            expect(Common.objHas(obj, ["field", "goo", "laste"])).to.be.false;
        });

        it("few fields, all exists", () => {
            const obj = { field: 1, goo: true, joe: "foo" };
            expect(Common.objHas(obj, ["field", "goo", "joe"])).to.be.true;
        });

        it("few fields, some names is not string", () => {
            const obj = { field: 1, goo: true, joe: "foo" };
            expect(Common.objHas(obj, [1, "goo", undefined])).to.be.false;
        });
    });
});

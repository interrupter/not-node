require("not-log")(false);

const expect = require("chai").expect,
    notManifestRouteResultFilter = require("../src/manifest/result.filter.js");

describe("notManifestRouteResultFilter", function () {
    describe("filter", function () {
        it("result is not an object", function () {
            const reqRes = undefined;
            notManifestRouteResultFilter.filter({}, reqRes);
            expect(reqRes).to.be.undefined;
        });

        it("filtering rule is undefined", function () {
            const reqRes = { some: "data" };
            const notRouteData = {};
            notManifestRouteResultFilter.filter(notRouteData, reqRes);
            expect(reqRes).to.be.deep.equal({ some: "data" });
        });

        it("filtering target is undefined", function () {
            const reqRes = { some: "data" };
            const notRouteData = {
                rule: { returnRoot: "result", return: ["some"] },
            };
            notManifestRouteResultFilter.filter(notRouteData, reqRes);
            expect(reqRes).to.be.deep.equal({ some: "data" });
        });

        it("all params ok", function () {
            const reqRes = { some: "data", error: false };
            const notRouteData = {
                rule: { return: ["some"] },
            };
            notManifestRouteResultFilter.filter(notRouteData, reqRes);
            expect(reqRes).to.be.deep.equal({ some: "data" });
        });
    });

    describe("filterByRule", function () {
        it("target undefined", function () {
            const reqRes = undefined;
            const rule = ["result"];
            notManifestRouteResultFilter.filterByRule(reqRes, rule);
            expect(reqRes).to.be.undefined;
        });

        it("rule undefined", function () {
            const reqRes = { some: "data" };
            const rule = undefined;
            notManifestRouteResultFilter.filterByRule(reqRes, rule);
            expect(reqRes).to.be.deep.equal({ some: "data" });
        });

        it("rule is not object or array", function () {
            const reqRes = { some: "data" };
            const rule = 1;
            notManifestRouteResultFilter.filterByRule(reqRes, rule);
            expect(reqRes).to.be.deep.equal({ some: "data" });
        });
    });

    describe("filterByMapRule", function () {
        it("strict", function () {
            const reqRes = {
                prop1: "1",
                prop2: {
                    sub: {
                        prop: {
                            id: 1,
                            name: "locale",
                        },
                        looser: "bummer",
                    },
                    stratification: true,
                },
                prop3: {
                    list: [
                        {
                            sub: {
                                id: 1,
                                name: "1",
                            },
                        },
                    ],
                },
                prop4: {
                    delta: [
                        { id: 1, name: "test" },
                        { id: 2, name: "test" },
                        { id: 3, name: "test" },
                    ],
                },
            };
            const rule = {
                prop1: true,
                "prop2.sub.prop": ["name"],
                "prop3.list": { sub: ["name"] },
                "prop4.delta": ["name"],
            };
            const expected = {
                prop1: "1",
                prop2: {
                    sub: {
                        prop: {
                            name: "locale",
                        },
                    },
                },
                prop3: {
                    list: [
                        {
                            sub: {
                                name: "1",
                            },
                        },
                    ],
                },
                prop4: {
                    delta: [
                        { name: "test" },
                        { name: "test" },
                        { name: "test" },
                    ],
                },
            };
            notManifestRouteResultFilter.filterByMapRule(reqRes, rule, true);
            expect(reqRes).to.be.deep.equal(expected);
        });

        it("not strict", function () {
            const reqRes = {
                prop1: "1",
                prop2: {
                    sub: {
                        prop: {
                            id: 1,
                            name: "locale",
                        },
                        looser: "bummer",
                    },
                    stratification: true,
                },
                prop3: {
                    list: [
                        {
                            sub: {
                                id: 1,
                                name: "1",
                            },
                        },
                    ],
                },
                prop4: {
                    delta: [
                        { id: 1, name: "test" },
                        { id: 2, name: "test" },
                        { id: 3, name: "test" },
                    ],
                },
                strict: false,
            };
            const rule = {
                prop1: true,
                "prop2.sub.prop": ["name"],
                "prop3.list": { sub: ["name"] },
                "prop4.delta": ["name"],
            };
            const expected = {
                prop1: "1",
                prop2: {
                    sub: {
                        prop: {
                            name: "locale",
                        },
                        looser: "bummer",
                    },
                    stratification: true,
                },
                prop3: {
                    list: [
                        {
                            sub: {
                                name: "1",
                            },
                        },
                    ],
                },
                prop4: {
                    delta: [
                        { name: "test" },
                        { name: "test" },
                        { name: "test" },
                    ],
                },
                strict: false,
            };
            notManifestRouteResultFilter.filterByMapRule(reqRes, rule);
            expect(reqRes).to.be.deep.equal(expected);
        });
    });

    describe("filterStrict", function () {
        it("filtering out side props", function () {
            const reqRes = {
                prop1: "1",
                prop2: {
                    sub: {
                        prop: {
                            id: 1,
                            name: "locale",
                        },
                        looser: "bummer",
                    },
                    stratification: true,
                },
                prop3: {
                    list: [
                        {
                            sub: {
                                id: 1,
                                name: "1",
                            },
                        },
                    ],
                },
                prop4: {
                    delta: [
                        { id: 1, name: "test" },
                        { id: 3, name: "test" },
                        { id: 3, name: "test" },
                    ],
                },
            };
            const rule = [
                "prop1",
                "prop2.sub.prop",
                "prop3.list.sub",
                "prop4.delta",
            ];
            const expected = {
                prop1: "1",
                prop2: {
                    sub: {
                        prop: {
                            id: 1,
                            name: "locale",
                        },
                    },
                },
                prop3: {
                    list: [
                        {
                            sub: {
                                id: 1,
                                name: "1",
                            },
                        },
                    ],
                },
                prop4: {
                    delta: [
                        { id: 1, name: "test" },
                        { id: 3, name: "test" },
                        { id: 3, name: "test" },
                    ],
                },
            };
            notManifestRouteResultFilter.filterStrict(reqRes, rule);
            expect(reqRes).to.be.deep.equal(expected);
        });
    });

    describe("filterByArrayRule", function () {
        it("no return rule field", function () {
            const reqRes = {
                prop1: "1",
                prop2: "2",
                prop3: "3",
                prop4: "4",
            };
            const rule = ["prop1", "prop3"];
            const expected = {
                prop1: "1",
                prop3: "3",
            };
            notManifestRouteResultFilter.filterByArrayRule(reqRes, rule);
            expect(reqRes).to.be.deep.equal(expected);
        });
    });

    describe("getFilteringRule", function () {
        it("no return rule field", function () {
            const res = notManifestRouteResultFilter.getFilteringRule({});
            expect(res).to.be.undefined;
        });

        it("return rule field in actionData", function () {
            const res = notManifestRouteResultFilter.getFilteringRule({
                actionData: {
                    return: ["only", "this"],
                },
            });
            expect(res).to.be.deep.equal(["only", "this"]);
        });

        it("return rule field in rule", function () {
            const res = notManifestRouteResultFilter.getFilteringRule({
                rule: { return: ["only", "that"] },
            });
            expect(res).to.be.deep.equal(["only", "that"]);
        });
    });

    describe("getFilteringTargetPath", function () {
        it("no path field", function () {
            const res = notManifestRouteResultFilter.getFilteringTargetPath({});
            expect(res).to.be.equal(":");
        });

        it("path field in actionData", function () {
            const res = notManifestRouteResultFilter.getFilteringTargetPath({
                actionData: {
                    returnRoot: "only.this",
                },
            });
            expect(res).to.be.deep.equal(":only.this");
        });

        it("path field in rule", function () {
            const res = notManifestRouteResultFilter.getFilteringTargetPath({
                rule: { returnRoot: "only.that" },
            });
            expect(res).to.be.deep.equal(":only.that");
        });

        it("notRouteData is undefined", function () {
            const res = notManifestRouteResultFilter.getFilteringTargetPath();
            expect(res).to.be.equal(":");
        });
    });

    describe("getFilteringTarget", function () {
        const requestResult = () => {
            return {
                message: "some",
                status: "ok",
                result: {
                    list: [1],
                },
            };
        };

        it("no target object by path, returned undefined", function () {
            const res = notManifestRouteResultFilter.getFilteringTarget(
                requestResult(),
                {
                    actionData: { returnRoot: "result.user" },
                }
            );
            expect(res).to.be.undefined;
        });

        it("returnRoot path is empty", function () {
            const res = notManifestRouteResultFilter.getFilteringTarget(
                requestResult(),
                {}
            );
            expect(res).to.be.deep.equal(requestResult());
        });

        it("returnRoot path is valid, sub object returned", function () {
            const res = notManifestRouteResultFilter.getFilteringTarget(
                requestResult(),
                {
                    actionData: { returnRoot: "result" },
                }
            );
            expect(res).to.be.deep.equal(requestResult().result);
        });

        it("return target is not object, source object returned", function () {
            const res = notManifestRouteResultFilter.getFilteringTarget(
                "string",
                {
                    actionData: { returnRoot: "result" },
                }
            );
            expect(res).to.be.deep.equal("string");
        });
    });

    describe("getFilteringStrictMode", function () {
        it("no strict mode field", function () {
            const res = notManifestRouteResultFilter.getFilteringStrictMode({});
            expect(res).to.be.equal(
                notManifestRouteResultFilter.DEFAULT_STRICT_MODE
            );
        });

        it("strict mode field in actionData", function () {
            const res = notManifestRouteResultFilter.getFilteringStrictMode({
                actionData: {
                    returnStrict: true,
                },
            });
            expect(res).to.be.equal(true);
        });

        it("strict mode field in rule", function () {
            const res = notManifestRouteResultFilter.getFilteringStrictMode({
                rule: { returnStrict: true },
            });
            expect(res).to.be.equal(true);
        });

        it("notRouteData is undefined", function () {
            const res = notManifestRouteResultFilter.getFilteringStrictMode();
            expect(res).to.be.equal(false);
        });
    });
});

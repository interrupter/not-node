const mock = require("mock-require");

let staticFunction = function () {};

const mod = {
    static: function () {
        return staticFunction;
    },
};
mock.stop("serve-static");
mock("serve-static", mod.static);

const InitStatic = require("../../src/init/lib/static");

module.exports = ({ expect }) => {
    describe("Static", () => {
        describe("getUserRole", () => {
            it("user exists", () => {
                const res = InitStatic.getUserRole({
                    user: {
                        role: "user",
                    },
                });
                expect(res).to.be.equal("user");
            });

            it("user not exists", () => {
                const res = InitStatic.getUserRole({});
                expect(res).to.be.equal("guest");
            });
        });

        describe("selectVersion", () => {
            it("user exists, ext - js", () => {
                const config = {
                    get(str) {
                        return {
                            "user:roles:priority": ["root", "user", "guest"],
                            "path:front": "path_from_fake",
                        }[str];
                    },
                };
                const res = InitStatic.selectVersion(
                    config,
                    {
                        user: {
                            role: "user",
                        },
                    },
                    "js"
                );
                expect(res).to.be.equal("path_from_fake/user.js");
            });

            it("user role not in list", () => {
                const config = {
                    get(str) {
                        return {
                            "path:front": "path_from_fake",
                        }[str];
                    },
                };
                const res = InitStatic.selectVersion(
                    config,
                    {
                        user: {
                            role: "manager",
                        },
                    },
                    "js"
                );
                expect(res).to.be.equal("path_from_fake/guest.js");
            });
        });

        describe("createStaticFrontServer", () => {
            it("user exists, ext - js", () => {
                InitStatic.serveStatic = mod.static;
                const config = {
                    get(str) {
                        return {
                            "user:roles:priority": ["root", "user", "guest"],
                            "path:front": "path_from_fake",
                        }[str];
                    },
                };
                const res = InitStatic.createStaticFrontServer("js", {
                    config,
                    options: {
                        pathToApp: "pathToApp__fake",
                    },
                });
                staticFunction = (rq, rs, nxt) => {
                    console.log("new static function");
                    throw new Error("Some fake error");
                };
                expect(typeof res).to.be.equal("function");
                res({}, {}, (e) => {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal("Some fake error");
                });
            });
        });

        describe("run", () => {
            it("generic", async () => {
                const master = {
                    getServer() {
                        return {
                            use(route, func) {
                                expect(typeof route).to.be.equal("string");
                                expect(typeof func).to.be.equal("function");
                            },
                        };
                    },
                };
                await new InitStatic().run({ master });
            });
        });
    });
};

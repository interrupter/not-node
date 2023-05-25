const InitSessionsMongo = require("../../../src/init/lib/sessions/mongoose");
const mock = require("mock-require");

module.exports = ({ expect }) => {
    describe("InitSessionsMongo", () => {
        describe("run", () => {
            it("run, middleware returned and set", async () => {
                let events = [];

                mock("express-session", (cnf) => {
                    expect(cnf).have.keys([
                        "secret",
                        "key",
                        "cookie",
                        "resave",
                        "saveUninitialized",
                        "store",
                    ]);
                    return () => {};
                });
                mock("connect-mongodb-session", (inpt) => {
                    expect(typeof inpt).to.be.equal("function");
                    return class FakeRedis {
                        on(name, arg) {
                            expect(typeof name).to.be.equal("string");
                            expect(typeof arg).to.be.equal("function");
                            events.push(name);
                            arg(new Error("test error"));
                        }
                    };
                });

                const config = {
                    get(str) {
                        return str + "__fake";
                    },
                };

                const master = {
                    getServer() {
                        return {
                            use(arg) {
                                expect(typeof arg).to.be.equal("function");
                            },
                        };
                    },
                    getApp() {
                        return {
                            report(arg) {
                                expect(arg).to.be.instanceof(Error);
                            },
                        };
                    },
                };
                await new InitSessionsMongo().run({
                    master,
                    config,
                    emit: require("../../fakes").createFakeEmit(),
                });
                expect(events.sort()).to.be.deep.equal(
                    ["error", "connected"].sort()
                );
            });
        });
    });
};

const InitMiddleware = require("../../src/init/lib/middleware");
const mock = require("mock-require");
const createFakeEmit = (val, err) => {
    return async () => {
        if (err) {
            throw err;
        } else {
            return val;
        }
    };
};
module.exports = ({ expect }) => {
    describe("Middleware", () => {
        describe("run", () => {
            it("config middleware empty", async () => {
                const fEmit = createFakeEmit();
                const config = {
                    get() {
                        return false;
                    },
                };
                await new InitMiddleware().run({
                    config,
                    emit: fEmit,
                });
            });

            mock("not-fake-mod", () => {});
            mock("not-fake-mod-2-path", {
                middleware() {},
            });

            mock("not-fake-mod-getMiddleware", {
                getMiddleware(opts) {
                    expect(opts).to.be.deep.equal({
                        params: true,
                    });
                    return () => {};
                },
            });

            it("config middleware not empty", async () => {
                const fEmit = createFakeEmit();
                const config = {
                    get() {
                        return {
                            "not-fake-mod": {},
                            "not-fake-mod-2": {
                                path: "not-fake-mod-2-path",
                            },
                            "not-fake-mod-getMiddleware": {
                                params: true,
                            },
                        };
                    },
                };
                const fakeServer = {
                    use(func) {
                        expect(typeof func).to.be.equal("function");
                    },
                };
                const master = {
                    getServer() {
                        return fakeServer;
                    },
                };
                await new InitMiddleware().run({
                    config,
                    master,
                    emit: fEmit,
                });
            });
        });
    });
};

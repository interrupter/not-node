const InitExpress = require("../../src/init/lib/express");
const mock = require("mock-require");

module.exports = ({ expect }) => {
    describe("Express", () => {
        describe("requestLogging", () => {
            it("next called", () => {
                let nextCalled = false;
                const master = {
                    getServer() {
                        return {
                            use(func) {
                                expect(typeof func).to.be.equal("function");
                                func(true, true, () => {
                                    nextCalled = true;
                                });
                            },
                        };
                    },
                };
                InitExpress.requestLogging({ master });
                expect(nextCalled).to.be.true;
            });
        });

        describe("run", () => {
            it("ok", async () => {
                let nextCalled = false;
                mock("express", () => {
                    return {
                        use(func) {
                            expect(typeof func).to.be.equal("function");
                            func(true, true, () => {
                                nextCalled = true;
                            });
                        },
                    };
                });
                const master = {
                    setServer(expr) {
                        this._server = expr;
                    },
                    getServer() {
                        return this._server;
                    },
                };
                await new InitExpress().run({
                    emit: require("../fakes").createFakeEmit(),
                    master,
                });
                expect(nextCalled).to.be.true;
            });
        });

        after(() => {
            mock.stop("express");
        });
    });
};

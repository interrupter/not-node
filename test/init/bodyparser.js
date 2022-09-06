const InitBodyparser = require("../../src/init/lib/bodyparser");
const mock = require("mock-require");

module.exports = ({ expect }) => {
    describe("BodyParser", () => {
        describe("run", () => {
            it("run, middleware returned and set", async () => {
                let useCalled = false;
                let middlewareGeneratorCalled = 0;
                mock("body-parser", {
                    json(param) {
                        expect(typeof param).to.be.equal("object");
                        middlewareGeneratorCalled++;
                        return () => {};
                    },
                    urlencoded(param) {
                        expect(typeof param).to.be.equal("object");
                        middlewareGeneratorCalled++;
                        return () => {};
                    },
                });
                const master = {
                    getServer() {
                        return {
                            use(func) {
                                expect(typeof func).to.be.equal("function");
                                useCalled = true;
                            },
                        };
                    },
                };
                await new InitBodyparser().run({ master });
                expect(useCalled).to.be.true;
                expect(middlewareGeneratorCalled).to.be.equal(2);
            });
        });

        after(() => {
            mock.stop("body-parser");
        });
    });
};

const InitFileupload = require("../../src/init/lib/fileupload");
const mock = require("mock-require");

module.exports = ({ expect }) => {
    describe("Fileupload", () => {
        describe("run", () => {
            it("run, middleware returned and set", async () => {
                let useCalled = false;
                let middlewareGeneratorCalled = false;
                mock("express-fileupload", (param) => {
                    expect(typeof param).to.be.equal("object");
                    middlewareGeneratorCalled = true;
                    return () => {};
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
                await new InitFileupload().run({ master });
                expect(useCalled).to.be.true;
                expect(middlewareGeneratorCalled).to.be.true;
            });
        });

        after(() => {
            mock.stop("express-fileupload");
        });
    });
};

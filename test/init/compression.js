const InitCompression = require("../../src/init/lib/compression");
const mock = require("mock-require");

module.exports = ({ expect }) => {
    describe("Compression", () => {
        describe("run", () => {
            it("run, middleware returned and set", async () => {
                let useCalled = false;
                let compressionCalled = false;
                mock("compression", () => {
                    compressionCalled = true;
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
                await new InitCompression().run({
                    emit: require("../fakes").createFakeEmit(),
                    master,
                });
                expect(useCalled).to.be.true;
                expect(compressionCalled).to.be.true;
            });
        });

        after(() => {
            mock.stop("compression");
        });
    });
};

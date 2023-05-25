const InitCORS = require("../../src/init/lib/cors");
const mock = require("mock-require");

mock("cors", () => {
    return () => {};
});

module.exports = ({ expect }) => {
    describe("InitCORS", () => {
        it("getOriginFilter", () => {
            const res = InitCORS.getOriginFilter(["name1", "name3"]);
            res("name", (a, b) => {
                expect(a).to.be.null;
                expect(b).to.be.false;
            });
            res("name1", (a, b) => {
                expect(a).to.be.null;
                expect(b).to.be.true;
            });
        });

        it("run", async () => {
            let mdSet = false;
            const config = {
                get(str) {
                    return {
                        cors: ["domain1", "domain2"],
                    }[str];
                },
            };
            const master = {
                getServer() {
                    return {
                        use(md) {
                            expect(typeof md).to.be.equal("function");
                            mdSet = true;
                        },
                    };
                },
            };
            await new InitCORS().run({
                config,
                master,
                emit: require("../fakes").createFakeEmit(),
            });
            expect(mdSet).to.be.equal(true);
        });
    });
};

const ADDS = require("../../src/init/additional");

module.exports = ({ expect }) => {
    describe("Addtional", () => {
        it("init/run", async () => {
            ADDS.init(5);
            const res = await ADDS.run("m", "asd");
            expect(res).to.be.undefined;
            ADDS.init({
                m() {
                    return Array.from(arguments).join(".");
                },
                async t() {
                    return Array.from(arguments).join(".");
                },
                obj: {
                    data: {
                        collection: {
                            runnable() {
                                return "executed";
                            },
                        },
                    },
                },
            });
            const res1 = await ADDS.run("m", "asd");
            expect(res1).to.be.equal("asd");
            const res2 = await ADDS.run("t", "sd");
            expect(res2).to.be.equal("sd");
            const res3 = await ADDS.run("obj.data.collection.runnable");
            expect(res3).to.be.equal("executed");
        });
    });
};

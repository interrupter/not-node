const BatchRunner = require("../../src/manifest/batchRunner");

module.exports = (input) => {
    const { expect } = input;

    describe("BatchRunner", () => {
        it("setProcessors", (done) => {
            const param = "query";
            const regs = [
                {
                    run(t) {
                        expect(t).to.be.equal(param);
                        done();
                    },
                },
            ];
            const runner = new BatchRunner();
            runner.setProcessors(regs);
            expect(runner.processors).to.be.deep.equal(regs);
            runner.processors[0].run(param);
        });

        it("resetBatchRunners", () => {
            const regs = [
                () => {},
                () => {},
                () => {},
                () => {},
                () => {},
                () => {},
            ];
            const runner = new BatchRunner();
            runner.setProcessors(regs);
            expect(runner.processors.length).to.be.equal(6);
            runner.resetProcessors();
            expect(runner.processors.length).to.be.equal(0);
        });

        it("with paths", () => {
            const nModule = {
                module: {
                    paths: {},
                },
            };
            const runner = new BatchRunner();
            runner.setProcessors([]);
            const res = runner.exec({ nModule });
            expect(res).to.be.true;
        });

        it("without paths", function () {
            const nModule = { module: {} };
            const runner = new BatchRunner();
            const res = runner.exec({ nModule });
            expect(res).to.be.false;
        });

        require("./fields")(input);
        require("./models")(input);
        require("./logics")(input);
        require("./routes")(input);
        require("./routes.ws")(input);
        require("./locales")(input);
    });
};

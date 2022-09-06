const InitMonitoring = require("../../src/init/lib/monitoring");
const mock = require("mock-require");

module.exports = ({ expect }) => {
    describe("Monitoring", () => {
        it("run", async () => {
            let event = false;
            mock("not-monitor", {
                monitor: {
                    on(name, cb) {
                        expect(name).to.be.equal("afterReportError");
                        expect(typeof cb).to.be.equal("function");
                        event = true;
                        cb(new Error("some error"));
                    },
                },
            });
            await new InitMonitoring().run();
            expect(event).to.be.equal(true);
        });

        after(() => {
            mock.stop("not-monitor");
        });
    });
};

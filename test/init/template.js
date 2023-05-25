const InitTemplate = require("../../src/init/lib/template");

module.exports = ({ expect }) => {
    describe("InitTemplate", () => {
        describe("run", () => {
            it("run, middleware returned and set", async () => {
                let setCalled = 0;
                const master = {
                    getAbsolutePath(str) {
                        return `${str}_fake_path`;
                    },
                    getServer() {
                        return {
                            set(key, val) {
                                setCalled++;
                                expect(key).to.be.ok;
                                expect(val).to.be.ok;
                            },
                        };
                    },
                };
                const config = {
                    get(str) {
                        return {
                            engine: `${str}_fake_config_engine`,
                            views: `${str}_fake_config_views`,
                        };
                    },
                };
                await new InitTemplate().run({
                    emit: require("../fakes").createFakeEmit(),
                    master,
                    config,
                });
                expect(setCalled).to.be.equal(2);
            });
        });

        describe("loadConfig", () => {
            it("config not set for template", async () => {
                const res = InitTemplate.loadConfig({
                    config: {
                        get() {
                            return false;
                        },
                    },
                });
                expect(res).to.be.deep.equal({
                    views: "views",
                    engine: "pug",
                });
            });
        });
    });
};

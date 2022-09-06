const InitSessions = require("../../src/init/lib/sessions");
const mock = require("mock-require");

module.exports = ({ expect }) => {
    describe("Sessions", () => {
        describe("getConstructor", () => {
            describe("getConstructor", () => {
                it("driver mongo", () => {
                    const res = InitSessions.getConstructor({
                        driver: "mongo",
                    });
                    expect(res.prototype.constructor.name).to.be.equal(
                        "InitSessionsMongo"
                    );
                });
                it("driver redis", () => {
                    const res = InitSessions.getConstructor({
                        driver: "redis",
                    });
                    expect(res.prototype.constructor.name).to.be.equal(
                        "InitSessionsRedis"
                    );
                });
                it("driver not set", () => {
                    const res = InitSessions.getConstructor({});
                    expect(res.prototype.constructor.name).to.be.equal(
                        "InitSessionsMongo"
                    );
                });
            });

            describe("run", () => {
                it("driver loaded ok", async () => {
                    let constRunned = false;
                    let runRunned = false;
                    mock(
                        "../../src/init/sessions/redis.js",
                        class A {
                            constructor() {
                                constRunned = true;
                            }
                            async run() {
                                runRunned = true;
                            }
                        }
                    );
                    const config = {
                        get() {
                            return {
                                driver: "redis",
                            };
                        },
                    };
                    await new InitSessions().run({
                        config,
                    });
                    expect(constRunned).to.be.true;
                    expect(runRunned).to.be.true;
                });

                it("driver loaded, but not class", async () => {
                    try {
                        mock("../../src/init/sessions/mongo.js", 2);
                        const config = {
                            get() {
                                return {
                                    driver: "rediska",
                                };
                            },
                        };
                        await new InitSessions().run({
                            config,
                        });
                    } catch (e) {
                        expect(e).to.be.instanceof(Error);
                    }
                });
            });

            after(() => {
                mock.stopAll();
            });
        });
        require("./sessions/redis")({
            expect,
        });
        require("./sessions/mongoose")({
            expect,
        });
    });
};

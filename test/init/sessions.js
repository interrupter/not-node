const InitSessions = require("../../src/init/lib/sessions");
const mock = require("mock-require");
const createFakeEmit = (val, err) => {
    return async () => {
        if (err) {
            throw err;
        } else {
            return val;
        }
    };
};

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
                    const fEmit = createFakeEmit();
                    const config = {
                        get() {
                            return {
                                driver: "redis",
                            };
                        },
                    };
                    await new InitSessions().run({
                        emit: fEmit,
                        config,
                        master: {
                            getEnv() {
                                return {};
                            },
                            getServer() {
                                return { use() {} };
                            },
                        },
                    });
                });

                it("driver loaded, but not class", async () => {
                    const fEmit = createFakeEmit();
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
                            emit: fEmit,
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

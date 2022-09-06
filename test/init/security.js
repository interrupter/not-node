const InitSecurity = require("../../src/init/lib/security");
const mock = require("mock-require");

const DIRs = {
    connect: ["'self'", "*", "wss:", "https:", "'unsafe-inline'"],
    default: ["'self'", "*", "wss:", "https:", "'unsafe-inline'"],
    img: ["'self'", "data:"],
    script: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
    style: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
};

module.exports = ({ expect }) => {
    describe("Security", () => {
        describe("run", () => {
            it("ok", async () => {
                const config = {
                    get(str) {
                        return {
                            cors: ["host.a", "host.b"],
                            CSP: DIRs,
                        }[str];
                    },
                };
                const master = {
                    getServer() {
                        return {
                            use(func) {
                                expect(typeof func).to.be.equal("function");
                            },
                        };
                    },
                    getApp() {
                        return {
                            execInModules(str) {
                                executed = str;
                            },
                        };
                    },
                };
                mock("helmet", (arg) => {
                    expect(arg).to.be.ok;
                    expect(arg).to.have.keys(["contentSecurityPolicy"]);
                    return () => {};
                });
                await new InitSecurity().run({ master, config });
            });

            it("ok, getCSPDirectives throwed", async () => {
                const config = {
                    get(str) {
                        return {
                            cors: ["host.a", "host.b"],
                            CSP: "asd",
                        }[str];
                    },
                };
                const master = {
                    getServer() {
                        return {
                            use(func) {
                                expect(typeof func).to.be.equal("function");
                            },
                        };
                    },
                    getApp() {
                        return {
                            execInModules(str) {
                                executed = str;
                            },
                        };
                    },
                };
                mock("helmet", (arg) => {
                    expect(arg).to.be.ok;
                    expect(arg).to.have.keys(["contentSecurityPolicy"]);
                    return () => {};
                });
                await new InitSecurity().run({ master, config });
            });
        });

        after(() => {
            mock.stop("helmet");
        });
    });
};

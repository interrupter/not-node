const InitRoutes = require("../../src/init/lib/routes");
const { notError, notRequestError } = require("not-error");
const mock = require("mock-require");

module.exports = ({ expect }) => {
    describe("Routes", () => {
        mock("serve-static", () => {});
        describe("finalError", () => {
            it("Error, !statusCode", (done) => {
                const req = {
                    url: "failure_path",
                };
                const res = {
                    status(code) {
                        expect(code).to.be.equal(500);
                    },
                    json(dat) {
                        expect(dat).to.be.deep.equal({
                            status: "error",
                            message: "Serious generic error",
                        });
                        done();
                    },
                };
                const master = {
                    getApp() {
                        return {
                            report(err) {
                                expect(err).to.be.instanceof(notError);
                            },
                        };
                    },
                };
                const final = InitRoutes.finalError({ master });
                final(new Error("Serious generic error"), req, res);
            });

            it("!Error, !statusCode", (done) => {
                const req = {
                    url: "failure_path",
                };
                const res = {
                    status(code) {
                        expect(code).to.be.equal(500);
                        return this;
                    },
                    json(dat) {
                        expect(dat).to.be.deep.equal({
                            status: "error",
                        });
                        done();
                    },
                };
                const master = {
                    getApp() {
                        return {
                            report(err) {
                                expect(err).to.be.instanceof(notError);
                            },
                        };
                    },
                };
                const final = InitRoutes.finalError({ master });
                final("Serious generic error", req, res);
            });

            it("notError, !statusCode", (done) => {
                const req = {
                    url: "failure_path",
                };
                const res = {};
                const master = {
                    getApp() {
                        return {
                            report(err) {
                                expect(err).to.be.instanceof(notError);
                                done();
                            },
                        };
                    },
                };
                const final = InitRoutes.finalError({ master });
                final(new notError("Serious not error", {}), req, res);
            });

            it("notRequestError, redirect, code = 404", (done) => {
                const req = {
                    url: "failure_path",
                };
                const res = {
                    redirect(url) {
                        expect(url).to.be.equal("redirect_url_fake");
                        done();
                    },
                };
                const master = {
                    getApp() {
                        return {
                            report(err) {
                                expect(err).to.be.instanceof(notRequestError);
                            },
                        };
                    },
                };
                const final = InitRoutes.finalError({ master });
                final(
                    new notRequestError("Serious not error", {
                        code: 404,
                        redirect: "redirect_url_fake",
                    }),
                    req,
                    res
                );
            });

            it("notRequestError, no redirect, code = 404", (done) => {
                const req = {
                    url: "failure_path",
                };
                const res = {
                    status(code) {
                        expect(code).to.be.equal(404);
                        return this;
                    },
                    json(dat) {
                        expect(dat).to.be.deep.equal({
                            status: "error",
                            message: "Serious not error request",
                            errors: { field: ["name"] },
                        });
                        done();
                    },
                };
                const master = {
                    getApp() {
                        return {
                            report(err) {
                                expect(err).to.be.instanceof(notRequestError);
                            },
                        };
                    },
                };
                const final = InitRoutes.finalError({ master });
                final(
                    new notRequestError("Serious not error request", {
                        code: 404,
                        errors: { field: ["name"] },
                    }),
                    req,
                    res
                );
            });
        });

        describe("run", () => {
            it("run", async () => {
                const fakeServer = {
                    sarver: true,
                    use(fn) {
                        expect(typeof fn).to.be.equal("function");
                    },
                };
                const fakeApp = {
                    report() {},
                    use(fn) {
                        expect(typeof fn).to.be.equal("function");
                    },
                    expose(ser) {
                        expect(ser).to.be.deep.equal(fakeServer);
                    },
                    async execInModules() {},
                };
                mock("main-not-app-routes", (ser, app) => {
                    expect(ser).to.be.deep.equal(fakeServer);
                    expect(app).to.be.deep.equal(fakeApp);
                });
                const options = {
                    indexRoute: () => {},
                    routesPath: "main-not-app-routes",
                };
                const master = {
                    getServer() {
                        return fakeServer;
                    },
                    getEnv(str) {
                        return str + "__fake";
                    },
                    getApp() {
                        return fakeApp;
                    },
                };
                await new InitRoutes().run({ master, options });
            });
        });
    });
};

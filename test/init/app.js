const path = require("node:path");
const ADDS = require("../../src/init/additional");
const InitApp = require("../../src/init/lib/app");
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
    describe("App", () => {
        describe("createApp", () => {
            it("not emits to call", async () => {
                const fEmit = createFakeEmit();
                let constructorCalled = false;
                const fakeMongoose = {
                    this: "is fake indeed",
                };
                const config = { fake: "config" };
                const options = { fake: "options" };
                class FakeApp {
                    constructor({ mongoose }) {
                        expect(mongoose).to.be.deep.equal(fakeMongoose);
                        constructorCalled = true;
                    }
                }
                InitApp.AppConstructor = FakeApp;
                const master = {
                    setApp(app) {
                        expect(app).to.be.instanceof(FakeApp);
                    },
                    getMongoose() {
                        return fakeMongoose;
                    },
                    getAbsolutePath(val) {
                        return val;
                    },
                };

                await InitApp.createApp({
                    master,
                    config,
                    options,
                    emit: fEmit,
                });
                expect(constructorCalled).to.be.true;
            });

            it("calls emit", async () => {
                let constructorCalled = false;
                let preCalled = false;
                let postCalled = false;
                ADDS.init({
                    app: {
                        create: {
                            pre() {
                                preCalled = true;
                            },
                            post() {
                                postCalled = true;
                            },
                        },
                    },
                });
                const fakeMongoose = {
                    this: "is fake indeed",
                };
                const config = { fake: "config" };
                const options = { fake: "options" };
                class FakeApp {
                    constructor({ mongoose }) {
                        expect(mongoose).to.be.deep.equal(fakeMongoose);
                        constructorCalled = true;
                    }
                }
                InitApp.AppConstructor = FakeApp;
                const master = {
                    setApp(app) {
                        expect(app).to.be.instanceof(FakeApp);
                    },
                    getMongoose() {
                        return fakeMongoose;
                    },
                    getAbsolutePath(val) {
                        return val;
                    },
                };

                await InitApp.createApp({
                    master,
                    config,
                    options,
                    emit: ADDS.run.bind(ADDS),
                });
                expect(constructorCalled).to.be.true;
                expect(preCalled).to.be.true;
                expect(postCalled).to.be.true;
            });
        });

        describe("setAppEnvs", () => {
            const fakeManifest = {
                targets: {
                    server: {
                        roles: ["root", "guest"],
                    },
                },
            };
            it("runs ok and emits", async () => {
                let preCalled = false;
                let postCalled = false;
                ADDS.init({
                    app: {
                        setEnv: {
                            pre() {
                                preCalled = true;
                            },
                            post() {
                                postCalled = true;
                            },
                        },
                    },
                });

                const config = { get: (str) => str + "_fake" };
                const options = { fake: "options" };
                const fakeApp = {
                    setEnv() {},
                };
                const master = {
                    getApp() {
                        return fakeApp;
                    },
                    getManifest() {
                        return fakeManifest;
                    },
                    setEnv() {},
                    getAbsolutePath(val) {
                        return val;
                    },
                };

                await InitApp.setAppEnvs({
                    master,
                    config,
                    options,
                    emit: ADDS.run.bind(ADDS),
                });

                expect(preCalled).to.be.true;
                expect(postCalled).to.be.true;
            });
        });

        describe("importModules", () => {
            const fakeManifest = {
                targets: {
                    server: {
                        roles: ["root", "guest"],
                    },
                },
            };
            it("runs ok and emits", async () => {
                let preCalled = false;
                let postCalled = false;
                ADDS.init({
                    app: {
                        importModules: {
                            pre() {
                                preCalled = true;
                            },
                            post() {
                                postCalled = true;
                            },
                        },
                    },
                });

                const config = {
                    get: (str) => {
                        if (str === "importModulesFromNPM") {
                            return ["fakeMod", "fakeMod2"];
                        } else {
                            return str + "_fake";
                        }
                    },
                };
                const options = { fake: "options" };
                const fakeApp = {
                    setEnv() {},
                    importModulesFrom(modsPath) {
                        expect(modsPath).to.be.equal("modulesPath_fake");
                    },
                    importModuleFrom(modPath, modName) {
                        expect(modPath).to.be.equal("npmPath_fake/" + modName);
                    },
                };
                const master = {
                    getApp() {
                        return fakeApp;
                    },
                    getManifest() {
                        return fakeManifest;
                    },
                    getEnv(name) {
                        return `${name}_fake`;
                    },
                };

                await InitApp.importModules({
                    master,
                    config,
                    options,
                    emit: ADDS.run.bind(ADDS),
                });

                expect(preCalled).to.be.true;
                expect(postCalled).to.be.true;
            });

            it("runs ok and emits, not config.importModulesFromNPM", async () => {
                let preCalled = false;
                let postCalled = false;
                ADDS.init({
                    app: {
                        importModules: {
                            pre() {
                                preCalled = true;
                            },
                            post() {
                                postCalled = true;
                            },
                        },
                    },
                });

                const config = {
                    get: (str) => {
                        return str + "_fake";
                    },
                };
                const options = { fake: "options" };
                const fakeApp = {
                    setEnv() {},
                    importModulesFrom(modsPath) {
                        expect(modsPath).to.be.equal("modulesPath_fake");
                    },
                    importModuleFrom(modPath, modName) {
                        expect(modPath).to.be.equal("npmPath_fake/" + modName);
                    },
                };
                const master = {
                    getApp() {
                        return fakeApp;
                    },
                    getManifest() {
                        return fakeManifest;
                    },
                    getEnv(name) {
                        return `${name}_fake`;
                    },
                };
                await InitApp.importModules({
                    master,
                    config,
                    options,
                    emit: ADDS.run.bind(ADDS),
                });
                expect(preCalled).to.be.true;
                expect(postCalled).to.be.true;
            });
        });

        describe("createReporter", () => {
            it("ok", async () => {
                const fEmit = createFakeEmit();
                let reporterConstructed = false;
                class FakeReporter {
                    constructor(opts) {
                        expect(opts.origin.server).to.be.equal("host_fake");
                        reporterConstructed = true;
                    }
                }
                InitApp.ReporterConstructor = FakeReporter;
                const config = { get: (str) => str + "_fake" };
                const options = { fake: "options" };
                const fakeApp = {
                    setEnv() {},
                };
                const master = {
                    getApp() {
                        return fakeApp;
                    },
                    getManifest() {
                        return fakeManifest;
                    },
                };
                await InitApp.createReporter({
                    master,
                    config,
                    options,
                    emit: fEmit,
                });
                expect(reporterConstructed).to.be.true;
            });

            it("failure", async () => {
                let reporterConstructed = false;
                class FakeReporter {
                    constructor(opts) {
                        expect(opts.origin.server).to.be.equal("host_fake");
                        reporterConstructed = true;
                        throw new Error("constructor throwed");
                    }
                }
                InitApp.ReporterConstructor = FakeReporter;
                const config = { get: (str) => str + "_fake" };
                const options = { fake: "options" };
                const fakeApp = {
                    setEnv() {},
                };
                const master = {
                    getApp() {
                        return fakeApp;
                    },
                    getManifest() {
                        return fakeManifest;
                    },
                };
                try {
                    await InitApp.createReporter({ master, config, options });
                } catch (e) {
                    expect(reporterConstructed).to.be.true;
                    expect(e.message).to.be.equal("constructor throwed");
                }
            });
        });

        describe("run", () => {
            const fakeManifest = {
                targets: {
                    server: {
                        roles: ["root", "guest"],
                    },
                },
            };

            it("ok, emits pre - ok,  throws from post emit", async () => {
                let constructorCalled = false;
                let preCalled = false;
                let postCalled = false;

                ADDS.init({
                    app: {
                        pre() {
                            preCalled = true;
                        },
                        post() {
                            postCalled = true;
                            throw new Error("Post throwed");
                        },
                    },
                });
                const fakeMongoose = {
                    this: "is fake indeed",
                };
                class FakeApp {
                    constructor({ mongoose }) {
                        expect(mongoose).to.be.deep.equal(fakeMongoose);
                        constructorCalled = true;
                    }
                }
                InitApp.AppConstructor = FakeApp;

                const config = {
                    get: (str) => {
                        if (str === "importModulesFromNPM") {
                            return ["fakeMod", "fakeMod2"];
                        } else {
                            return str + "_fake";
                        }
                    },
                };
                const options = { fake: "options" };
                const fakeApp = {
                    setEnv() {},
                    importModulesFrom(modsPath) {
                        expect(modsPath).to.be.equal("modulesPath_fake");
                    },
                    importModuleFrom(modPath, modName) {
                        console.log(
                            path.resolve("src/core"),
                            path.resolve("npmPath_fake/" + modName)
                        );
                        console.log(modPath, modName);
                        expect(
                            [
                                path.resolve("src/core"),
                                path.resolve("npmPath_fake/" + modName),
                            ].includes(path.resolve(modPath))
                        ).to.be.true;
                    },
                };
                const master = {
                    setEnv() {},
                    getEnv: (str) => {
                        if (str === "importModulesFromNPM") {
                            return ["fakeMod", "fakeMod2"];
                        } else {
                            return str + "_fake";
                        }
                    },
                    setApp(app) {
                        expect(app).to.be.instanceof(FakeApp);
                    },
                    throwError(e) {
                        throw new Error(e);
                    },
                    getMongoose() {
                        return fakeMongoose;
                    },
                    getApp() {
                        return fakeApp;
                    },
                    getManifest() {
                        return fakeManifest;
                    },
                    getAbsolutePath(val) {
                        return val;
                    },
                };
                try {
                    await new InitApp().run({
                        master,
                        config,
                        options,
                        emit: ADDS.run.bind(ADDS),
                    });
                } catch (e) {
                    expect(e.message).to.be.equal("Post throwed");
                    expect(constructorCalled).to.be.true;
                    expect(preCalled).to.be.true;
                    expect(postCalled).to.be.true;
                }
            });
        });
    });
};

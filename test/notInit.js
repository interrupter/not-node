const expect = require("chai").expect;
const Init = require("../src/init").Init;

describe("initialization", function () {
    describe("notInit", () => {
        describe("getAbsolutePath", () => {
            it("all set", () => {
                Init.options = {
                    pathToApp: "/home/admin/server/test",
                };
                const res = Init.getAbsolutePath("../src/index");
                expect(res).to.be.equal("/home/admin/server/src/index");
            });
        });

        describe("setManifest/getManifest", () => {
            it("set/get", () => {
                Init.setManifest({
                    manifest: "was set",
                });
                expect(Init.manifest).to.be.deep.equal({
                    manifest: "was set",
                });
            });
        });

        describe("setMongoose/getMongoose", () => {
            it("set/get", () => {
                Init.setMongoose({
                    mongoose: "was set",
                });
                expect(Init.mongoose).to.be.deep.equal({
                    mongoose: "was set",
                });
                expect(Init.getMongoose()).to.be.deep.equal({
                    mongoose: "was set",
                });
            });
        });

        describe("setServer/getServer", () => {
            it("set/get", () => {
                Init.setServer({
                    server: "was set",
                });
                expect(Init.server).to.be.deep.equal({
                    server: "was set",
                });
                expect(Init.getServer()).to.be.deep.equal({
                    server: "was set",
                });
            });
        });

        describe("setHTTPServer/getHTTPServer", () => {
            it("set/get", () => {
                Init.setHTTPServer({
                    httpServer: "was set",
                });
                expect(Init.httpServer).to.be.deep.equal({
                    httpServer: "was set",
                });
                expect(Init.getHTTPServer()).to.be.deep.equal({
                    httpServer: "was set",
                });
            });
        });

        describe("getApp/setApp", () => {
            it("set/get", () => {
                Init.setApp({
                    notApp: "was set",
                });
                expect(Init.notApp).to.be.deep.equal({
                    notApp: "was set",
                });
                expect(Init.getApp()).to.be.deep.equal({
                    notApp: "was set",
                });
            });
        });

        describe("initConfig", () => {
            it("config - not set", () => {
                Init.config = false;
                Init.initConfig();
                expect(Init.config).to.have.keys(["get", "set"]);
            });

            it("config - false", () => {
                Init.config = false;
                Init.initConfig(false);
                expect(Init.config).to.have.keys(["get", "set"]);
            });

            it("config - true", () => {
                Init.config = false;
                Init.initConfig(true);
                expect(Init.config).to.be.true;
                expect(Init.getConfig()).to.be.true;
            });
        });

        describe("getConfig", () => {
            it("config - true", () => {
                Init.config = true;
                expect(Init.getConfig()).to.be.true;
            });
        });

        describe("printOutManifest", () => {
            it("config - not set", () => {
                let called = false;
                Init.notApp = {
                    getManifest() {
                        called = true;
                        return {};
                    },
                };
                Init.printOutManifest();
                expect(called).to.be.true;
            });
        });

        describe("throwError", () => {
            it("no params", () => {
                try {
                    Init.throwError();
                    throw new Error("not that error");
                } catch (e) {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal("Fatal error");
                }
            });

            it("with params", () => {
                try {
                    Init.throwError("That error", 2);
                    throw new Error("not that error");
                } catch (e) {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal("That error");
                }
            });
        });

        describe("run", () => {
            it("ok, async pre", async () => {
                let preRunned = false;
                const config = { get() {}, set() {} },
                    options = { options: "is set" },
                    manifest = { manifest: "is set" },
                    additional = {
                        async pre(params) {
                            expect(params).to.have.keys([
                                "config",
                                "options",
                                "manifest",
                                "additional",
                                "initSequence",
                                "log",
                            ]);
                            expect(params.config).to.be.deep.equal(config);
                            expect(params.options).to.be.deep.equal(options);
                            expect(params.manifest).to.be.deep.equal(manifest);
                            preRunned = true;
                            params.initSequence.list = [];
                        },
                    };
                await Init.run({
                    config,
                    options,
                    manifest,
                    additional,
                });

                expect(preRunned).to.be.true;
            });

            it("failed, sync pre", async () => {
                const config = { get() {}, set() {} },
                    options = { options: "is set" },
                    manifest = { manifest: "is set" },
                    additional = {
                        pre(params) {
                            expect(params).to.have.keys([
                                "config",
                                "options",
                                "manifest",
                                "additional",
                                "initSequence",
                                "log",
                            ]);
                            expect(params.config).to.be.deep.equal(config);
                            expect(params.options).to.be.deep.equal(options);
                            expect(params.manifest).to.be.deep.equal(manifest);
                            preRunned = true;
                            params.initSequence.list = [];
                            throw new Error("Super error");
                        },
                    };
                try {
                    await Init.run({
                        config,
                        options,
                        manifest,
                        additional,
                    });
                } catch (e) {
                    expect(e).to.be.instanceof(Error);
                    expect(e.message).to.be.equal("Super error");
                }
            });
        });
    });

    require("./init/app")({ expect });
    require("./init/env")({ expect });
    require("./init/express")({ expect });
    require("./init/compression")({ expect });
    require("./init/methodoverride")({ expect });
    require("./init/middleware")({ expect });
    require("./init/security")({ expect });
    require("./init/sessions")({ expect });
    require("./init/monitoring")({ expect });
    require("./init/db")({ expect });
    require("./init/cors")({ expect });
    require("./init/http")({ expect });
    require("./init/bodyparser")({ expect });
    require("./init/fileupload")({ expect });
    require("./init/modules")({ expect });
    require("./init/routes")({ expect });
    require("./init/informer")({ expect });
    require("./init/static")({ expect });
    require("./init/template")({ expect });
    require("./init/additional")({ expect });
    require("./init/sequence")({ expect });
});

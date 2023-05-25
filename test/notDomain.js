const expect = require("chai").expect,
    notModule = require("../src/manifest/module"),
    notDomain = require("../src/domain");

const path = require("path");
const pathToModules = path.join(__dirname, "./testies/modules");

describe("notDomain", function () {
    describe("forEachMod", function () {
        it("modules not empty", function () {
            const ctx = {
                modules: {
                    user: {
                        module: true,
                    },
                    jom: false,
                },
            };
            notDomain.prototype.forEachMod.call(ctx, (modName, mod) => {
                expect(modName).to.be.equal("user");
                expect(mod).to.be.deep.equal({
                    module: true,
                });
            });
        });

        it("modules empty", function () {
            const ctx = {};
            notDomain.prototype.forEachMod.call(ctx, () => {});
        });
    });

    describe("importModulesFrom", function () {
        it("modules not empty", function () {
            let modsList = [];
            const ctx = {
                importModuleFrom(path, file) {
                    modsList.push(file);
                },
            };
            notDomain.prototype.importModulesFrom.call(ctx, pathToModules);
            expect(modsList).to.be.deep.equal([
                "not-test-module",
                "post",
                "user",
            ]);
        });
    });

    describe("importModuleFrom", function () {
        it("module not empty", function () {
            let imported = false;
            const pathToModule = path.join(pathToModules, "user");
            const ctx = {
                options: {
                    mongoose: require("mongoose"),
                },
                importModule(mod, name) {
                    expect(mod).to.be.instanceof(notModule);
                    expect(name).to.be.equal("not-user");
                    imported = true;
                },
            };
            notDomain.prototype.importModuleFrom.call(
                ctx,
                pathToModule,
                "testModule"
            );
            expect(imported).to.be.true;
        });

        it("module not empty, moduleName empty", function () {
            let imported = false;
            const pathToModule = path.join(pathToModules, "user");
            const ctx = {
                options: {
                    mongoose: require("mongoose"),
                },
                importModule(mod, name) {
                    expect(mod).to.be.instanceof(notModule);
                    expect(name).to.be.equal("not-user");
                    imported = true;
                },
            };
            notDomain.prototype.importModuleFrom.call(ctx, pathToModule);
            expect(imported).to.be.true;
        });
    });

    describe("importModule", function () {
        it("module not empty", function () {
            const mod = {
                mod: true,
            };
            const fModules = {};
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
                setModule(name, val) {
                    fModules[name] = val;
                },
            };
            notDomain.prototype.importModule.call(ctx, mod, "testModule");
            expect(ctx.modules.testModule).to.be.ok;
            expect(ctx.modules.testModule).to.be.deep.equal(mod);
        });
    });

    describe("getRoute", function () {
        it("route name missformed", function () {
            const route = "myWay";
            const ctx = {};
            const res = notDomain.prototype.getRoute.call(ctx, route);
            expect(res).to.be.null;
        });

        it("route name ok, module, route and action exists", function () {
            const route = "not-user//user//myWay";
            const id = Math.random();
            const fModules = {
                "not-user": {
                    getRoute() {
                        return {
                            myWay() {
                                return id;
                            },
                        };
                    },
                },
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getRoute.call(ctx, route);
            expect(typeof res).to.be.equal("function");
            expect(res()).to.be.equal(id);
        });

        it("route name ok, module not exists", function () {
            const route = "not-user//user//myWay";
            const id = Math.random();
            const fModules = {
                "not-user1": {
                    getRoute() {
                        return {
                            myWay() {
                                return id;
                            },
                        };
                    },
                },
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getRoute.call(ctx, route);
            expect(res).to.be.null;
        });

        it("route name ok, module exists, route not exists", function () {
            const route = "not-user//user//myWay";
            const id = Math.random();
            const fModules = {
                "not-user": {
                    getRoute() {
                        return false;
                    },
                },
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getRoute.call(ctx, route);
            expect(res).to.be.null;
        });

        it("route name ok, module exists, route exists, actio not exists", function () {
            const route = "not-user//user//myWay";
            const fModules = {
                "not-user": {
                    getRoute() {
                        return {};
                    },
                },
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getRoute.call(ctx, route);
            expect(res).to.be.null;
        });
    });

    describe("getModel", function () {
        it("model name short", function () {
            const route = "Jungle";
            const ctx = {
                getByPath() {
                    return null;
                },
            };
            const res = notDomain.prototype.getModel.call(ctx, route);
            expect(res).to.be.null;
        });

        it("model name full", function () {
            const id = Math.random();
            const route = "module//Jungle";
            const ctx = {
                getByPath() {
                    return id;
                },
            };
            const res = notDomain.prototype.getModel.call(ctx, route);
            expect(res).to.be.equal(id);
        });
    });

    describe("getModelFile", function () {
        it("name short", function () {
            const id = Math.random();
            const route = "Jungle";
            const ctx = {
                getByPath() {
                    return id;
                },
            };
            const res = notDomain.prototype.getModelFile.call(ctx, route);
            expect(res).to.be.equal(id);
        });

        it("name full", function () {
            const id = Math.random();
            const route = "module//Jungle";
            const ctx = {
                getByPath() {
                    return id;
                },
            };
            const res = notDomain.prototype.getModelFile.call(ctx, route);
            expect(res).to.be.equal(id);
        });
    });

    describe("getModelSchema", function () {
        it("name short", function () {
            const id = Math.random();
            const route = "Jungle";
            const ctx = {
                getByPath() {
                    return id;
                },
            };
            const res = notDomain.prototype.getModelSchema.call(ctx, route);
            expect(res).to.be.equal(id);
        });

        it("name full", function () {
            const id = Math.random();
            const route = "module//Jungle";
            const ctx = {
                getByPath() {
                    return id;
                },
            };
            const res = notDomain.prototype.getModelSchema.call(ctx, route);
            expect(res).to.be.equal(id);
        });
    });

    describe("getLogic", function () {
        it("name short", function () {
            const id = Math.random();
            const route = "Jungle";
            const ctx = {
                getByPath() {
                    return id;
                },
            };
            const res = notDomain.prototype.getLogic.call(ctx, route);
            expect(res).to.be.equal(id);
        });

        it("name full", function () {
            const id = Math.random();
            const route = "module//Jungle";
            const ctx = {
                getByPath() {
                    return id;
                },
            };
            const res = notDomain.prototype.getLogic.call(ctx, route);
            expect(res).to.be.equal(id);
        });
    });

    describe("getLogicFile", function () {
        it("name short", function () {
            const id = Math.random();
            const route = "Jungle";
            const ctx = {
                getByPath() {
                    return id;
                },
            };
            const res = notDomain.prototype.getLogicFile.call(ctx, route);
            expect(res).to.be.equal(id);
        });

        it("name full", function () {
            const id = Math.random();
            const route = "module//Jungle";
            const ctx = {
                getByPath() {
                    return id;
                },
            };
            const res = notDomain.prototype.getLogicFile.call(ctx, route);
            expect(res).to.be.equal(id);
        });
    });

    describe("getByFullPath", function () {
        it("path exists", function () {
            const id = Math.random();
            const path = "user//resource";
            const type = "File";
            const fModules = {
                user: {
                    getFile(name) {
                        expect(name).to.be.equal("resource");
                        return id;
                    },
                },
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getByFullPath.call(ctx, path, type);
            expect(res).to.be.equal(id);
        });

        it("path not exists", function () {
            const path = "usesr//resource";
            const type = "File";
            const fModules = {
                user: {
                    getFile(name) {
                        expect(name).to.be.equal("resource");
                        return id;
                    },
                },
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getByFullPath.call(ctx, path, type);
            expect(res).to.be.null;
        });
    });

    describe("getByShortPath", function () {
        it("path exists", function () {
            const id = Math.random();
            const path = "resource";
            const type = "File";
            const fModules = {
                lite: {
                    getFile() {
                        return false;
                    },
                },
                user: {
                    getFile(name) {
                        expect(name).to.be.equal("resource");
                        return id;
                    },
                },
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getByShortPath.call(
                ctx,
                path,
                type
            );
            expect(res).to.be.equal(id);
        });

        it("path not exists", function () {
            const path = "usesr";
            const type = "File";
            const fModules = {
                user: {
                    getFile() {
                        return null;
                    },
                },
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getByShortPath.call(
                ctx,
                path,
                type
            );
            expect(res).to.be.null;
        });
    });

    describe("getModule", function () {
        it("exists", function () {
            const route = "user";
            const fModules = {
                user: {
                    mod: "user",
                },
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getModule.call(ctx, route);
            expect(res).to.be.deep.equal({
                mod: "user",
            });
        });

        it("exists, but with custom name", function () {
            const route = "Jungle";
            const targetMod = {
                getName() {
                    return "Jungle";
                },
            };
            const fModules = {
                loop: {
                    getName() {
                        return "loop";
                    },
                },
                trees: targetMod,
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getModule.call(ctx, route);
            expect(res).to.be.deep.equal(targetMod);
        });

        it("not exists", function () {
            const route = "Jungle";
            const targetMod = {
                getName() {
                    return "Jungle1";
                },
            };
            const fModules = {
                loop: {
                    getName() {
                        return "loop";
                    },
                },
                trees: targetMod,
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getModule.call(ctx, route);
            expect(res).to.be.null;
        });
    });

    //execInModules
    describe("execInModules", function () {
        it("exec - ok", async () => {
            let executed = 0;
            const method = "jump";
            const fModules = {
                user: {
                    exec() {
                        executed++;
                    },
                },
                dof: {
                    async exec() {
                        executed++;
                    },
                },
            };
            const ctx = {
                modules: fModules,
                report(e) {
                    expect(e).to.be.instanceof(Error);
                },
                getModule(name) {
                    return fModules[name];
                },
            };
            await notDomain.prototype.execInModules.call(ctx, method);
            expect(executed).to.be.equal(2);
        });

        it("exec - one failed, other runned", async () => {
            let executed = 0,
                failed = false;
            const method = "jump";
            const fModules = {
                user: {
                    exec() {
                        executed++;
                    },
                },
                dof: {
                    async exec() {
                        throw "execution failed";
                    },
                },
                loaf: {
                    async exec() {
                        expect(failed).to.be.true;
                        executed++;
                    },
                },
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
                report(e) {
                    failed = true;
                    expect(e).to.be.equal("execution failed");
                },
            };
            await notDomain.prototype.execInModules.call(ctx, method);
            expect(executed).to.be.equal(2);
            expect(failed).to.be.true;
        });
    });

    describe("fabricate", function () {
        it("modules", function () {
            let cnt = 0;
            const fModules = {
                user: {
                    fabricateModels() {
                        cnt++;
                    },
                },
                load: {
                    fabricateModels() {
                        cnt++;
                    },
                },
                loaf: {},
                mepty: {
                    fabricateModels() {
                        cnt++;
                    },
                },
            };
            const ctx = {
                modules: fModules,
                getModule(name) {
                    return fModules[name];
                },
            };
            notDomain.prototype.fabricate.call(ctx);
            expect(cnt).to.be.equal(3);
        });
    });

    describe("logger", function () {
        it("getter/setter", function () {
            const dom = new notDomain({});
            expect(dom.logger).to.be.deep.equal(console);
            dom.logger = "happy";
            expect(dom.logger).to.be.deep.equal("happy");
        });

        it("log", function (done) {
            const dom = new notDomain({});
            const params = ["leet", 2, { cold: true }];
            expect(dom.logger).to.be.deep.equal(console);
            dom.logger = {
                log() {
                    expect(Array.from(arguments)).to.be.deep.equal(params);
                    done();
                },
            };
            dom.log(...params);
        });
    });

    describe("reporter", function () {
        it("getter/setter", function () {
            const dom = new notDomain({});
            expect(dom.reporter).to.have.keys(["report"]);
            dom.reporter = "happy";
            expect(dom.reporter).to.be.deep.equal("happy");
        });

        it("report", function () {
            const dom = new notDomain({});
            const params = ["leet", 2, { cold: true }];
            dom.report("some data");
            dom.reporter = {
                async report(...somedata) {
                    expect(somedata).to.be.deep.equal(params);
                    throw "ok";
                },
            };
            try {
                dom.reporter.report(params);
            } catch (e) {
                expect(e).to.be.equal("ok");
            }
        });
    });

    describe("informer", function () {
        it("getter/setter", function () {
            const dom = new notDomain({});
            expect(dom.informer).to.have.keys(["now"]);
            dom.informer = "happy";
            expect(dom.informer).to.be.deep.equal("happy");
        });

        it("inform", function () {
            const dom = new notDomain({});
            const params = ["leet", 2, { cold: true }];
            dom.inform("some data");
            dom.inform = {
                async now(...somedata) {
                    expect(somedata).to.be.deep.equal(params);
                    throw "ok";
                },
            };
            try {
                dom.inform.now(params);
            } catch (e) {
                expect(e).to.be.equal("ok");
            }
        });
    });

    describe("addWSServer", function () {
        it("set", function () {
            const dom = new notDomain({});
            dom.addWSServer("key", "happy");
            expect(dom.WSServer("key")).to.be.deep.equal("happy");
        });
    });

    describe("WSServer", function () {
        it("default(main) exists", function () {
            const dom = new notDomain({});
            dom.addWSServer("main", "happy");
            const res = dom.WSServer();
            expect(res).to.be.equal("happy");
        });

        it("default(main) not exists", function () {
            const dom = new notDomain({});
            const res = dom.WSServer();
            expect(res).to.be.undefined;
        });
    });

    describe("addWSClient", function () {
        it("set", function () {
            const dom = new notDomain({});
            dom.addWSClient("key", "happy");
            expect(dom.WSClient("key")).to.be.deep.equal("happy");
        });
    });

    describe("WSClient", function () {
        it("main exists", function () {
            const dom = new notDomain({});
            dom.addWSClient("main", "happy");
            const res = dom.WSClient("main");
            expect(res).to.be.equal("happy");
        });

        it("default(main) not exists", function () {
            const dom = new notDomain({});
            const res = dom.WSClient();
            expect(res).to.be.undefined;
        });
    });

    describe("shutdown", function () {
        it(`default timeout, ${notDomain.OPT_DEFAULT_SHUTDOWN_TIMEOUT}ms`, function (done) {
            const realProcess = process;
            const exitMock = () => {
                global.process = realProcess;
                done();
            };
            global.process = { ...realProcess, exit: exitMock };
            const ctx = {
                log(str) {
                    expect(str).to.be.equal(
                        `Перезагрузка сервиса через ${notDomain.OPT_DEFAULT_SHUTDOWN_TIMEOUT}мс...`
                    );
                },
                emit(evName) {
                    expect(evName).to.be.equal("app:shutdown");
                },
            };
            notDomain.prototype.shutdown.call(ctx);
        });

        it("custom timeout", function (done) {
            const TIMEOUT = 1000;
            const realProcess = process;
            const exitMock = () => {
                global.process = realProcess;
                done();
            };
            global.process = { ...realProcess, exit: exitMock };
            const ctx = {
                log(str) {
                    expect(str).to.be.equal(
                        `Перезагрузка сервиса через ${TIMEOUT}мс...`
                    );
                },
                emit(evName) {
                    expect(evName).to.be.equal("app:shutdown");
                },
            };
            notDomain.prototype.shutdown.call(ctx, TIMEOUT);
        });
    });

    describe("getStatus", function () {
        it("ok", function () {
            const ctx = {
                modules: {
                    "not-user": {
                        getStatus() {
                            return {
                                models: {
                                    count: 2,
                                    list: ["User", "Role"],
                                    content: {},
                                },
                                routes: {
                                    count: 2,
                                    list: ["user", "role"],
                                    content: {},
                                },
                                actions: {
                                    count: 2,
                                    list: ["user//list", "role//list"],
                                },
                                forms: {
                                    count: 3,
                                    list: [
                                        "user//listAll",
                                        "user//list",
                                        "role//list",
                                    ],
                                },
                            };
                        },
                    },
                },
                getModule(name) {
                    return fModules[name];
                },
            };
            const res = notDomain.prototype.getStatus.call(ctx);
            expect(res).to.be.deep.equal({
                modules: {
                    count: 1,
                    list: ["not-user"],
                    content: {
                        "not-user": {
                            models: {
                                count: 2,
                                list: ["User", "Role"],
                                content: {},
                            },
                            routes: {
                                count: 2,
                                list: ["user", "role"],
                                content: {},
                            },
                            actions: {
                                count: 2,
                                list: ["user//list", "role//list"],
                            },
                            forms: {
                                count: 3,
                                list: [
                                    "user//listAll",
                                    "user//list",
                                    "role//list",
                                ],
                            },
                        },
                    },
                },
                forms: {
                    count: 3,
                    list: [
                        "not-user//user//listAll",
                        "not-user//user//list",
                        "not-user//role//list",
                    ],
                },
                routes: {
                    count: 2,
                    list: ["not-user//user", "not-user//role"],
                },
                models: {
                    count: 2,
                    list: ["not-user//User", "not-user//Role"],
                },
                actions: {
                    count: 2,
                    list: ["not-user//user//list", "not-user//role//list"],
                },
                roles: {
                    count: 0,
                    list: [],
                },
            });
        });
    });
});

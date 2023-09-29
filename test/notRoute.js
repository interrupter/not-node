const { DEFAULT_USER_ROLE_FOR_ROOT } = require("../src/auth");
const notAppIdentity = require("../src/identity");

const HttpError = require("../src/error").Http,
    notRoute = require("../src/manifest/route"),
    expect = require("chai").expect;

describe("notRoute", function () {
    describe("init call", function () {
        it("Init object", function () {
            let routerAction = new notRoute(
                {},
                "not-user",
                "user",
                "getAll",
                {}
            );
            expect(routerAction).to.have.keys([
                "notApp",
                "routeName",
                "moduleName",
                "actionName",
                "actionData",
            ]);
        });
    });

    describe("selectRule", function () {
        it("User(auth) request, post.list action", function () {
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
            });
            let req = {},
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: false,
                        },
                        {
                            auth: true,
                        },
                        {
                            root: true,
                        },
                    ],
                },
                routerAction = new notRoute(
                    {},
                    "not-user",
                    "user",
                    "list",
                    actionData
                );
            expect(routerAction.selectRule(req)).to.deep.equal({
                auth: true,
            });
        });
        it("User(!auth) request, post.list action", function () {
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: false,
            });
            let req = {},
                actionData = {
                    method: "get",
                    rules: [
                        {
                            root: true,
                        },
                        {
                            auth: false,
                        },
                        {
                            auth: true,
                        },
                    ],
                },
                routerAction = new notRoute(
                    {},
                    "not-user",
                    "user",
                    "list",
                    actionData
                );
            expect(routerAction.selectRule(req)).to.deep.equal({
                auth: false,
            });
        });

        it("User(auth) request, post.listAll action", function () {
            let req = {},
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: true,
                            role: ["manager"],
                        },
                        {
                            root: true,
                        },
                    ],
                },
                routerAction = new notRoute(
                    {},
                    "not-user",
                    "user",
                    "listAll",
                    actionData
                );
            expect(routerAction.selectRule(req)).to.deep.equal(null);
        });

        it("User(auth, manager) request, post.listAll action", function () {
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
                role: ["manager"],
            });
            let req = {},
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: true,
                            role: ["manager"],
                        },
                        {
                            root: true,
                        },
                    ],
                },
                routerAction = new notRoute(
                    {},
                    "not-user",
                    "user",
                    "listAll",
                    actionData
                );
            expect(routerAction.selectRule(req)).to.deep.equal({
                auth: true,
                role: ["manager"],
            });
        });

        it("Admin request, post.listAll action", function () {
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
                root: true,
                primaryRole: DEFAULT_USER_ROLE_FOR_ROOT,
                role: [DEFAULT_USER_ROLE_FOR_ROOT],
            });
            let req = {},
                actionData = {
                    method: "get",
                    rules: [
                        {
                            root: true,
                        },
                        {
                            auth: true,
                            role: ["manager"],
                        },
                    ],
                },
                routerAction = new notRoute(
                    {},
                    "not-user",
                    "user",
                    "listAll",
                    actionData
                );
            expect(routerAction.selectRule(req)).to.deep.equal({
                root: true,
            });
        });

        it("Guest request, post.list action", function () {
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: false,
            });
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    auth: false,
                },
                routerAction = new notRoute(
                    {},
                    "not-user",
                    "user",
                    "list",
                    actionData
                ),
                rule = routerAction.selectRule(req);
            expect(rule).to.have.keys(["method", "auth"]);
            expect(rule.method).to.be.equal("get");
            expect(rule.auth).to.be.equal(false);
        });

        it("actionData - null", function () {
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: false,
            });
            let req = {},
                actionData = false,
                routerAction = new notRoute(
                    {},
                    "not-user",
                    "user",
                    "list",
                    actionData
                ),
                rule = routerAction.selectRule(req);
            expect(rule).to.be.null;
        });
    });

    describe("exec", function () {
        //manifest.registerRoutesPath('', __dirname + '/routes');
        //manifest.getManifest();
        let fakeRoute = {
                list: () => {
                    return "list";
                },
            },
            fakeMod = {
                getRoute: () => {
                    return fakeRoute;
                },
            },
            fakeNotApp = {
                getModule: () => {
                    return fakeMod;
                },
            };
        it("Guest request post.list", function (done) {
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    auth: false,
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post",
                    "list",
                    actionData
                );
            routerAction
                .exec(req)
                .then((result) => {
                    expect(result).to.deep.equal("list");
                    done();
                })
                .catch(done);
            //console.log('result', routerAction, actionData, result);
        });

        it("Admin request post.listAll", function (done) {
            let fakeRoute = {
                    _listAll: () => {
                        return "_listAll";
                    },
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeNotApp = {
                    getModule: () => {
                        return fakeMod;
                    },
                };
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
                root: true,
                primaryRole: DEFAULT_USER_ROLE_FOR_ROOT,
                role: [DEFAULT_USER_ROLE_FOR_ROOT],
            });
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: true,
                            role: ["manager"],
                        },
                        {
                            root: true,
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post",
                    "listAll",
                    actionData
                );
            routerAction
                .exec(req)
                .then((result) => {
                    expect(result).to.deep.equal("_listAll");
                    done();
                })
                .catch(done);
        });

        it("Auth with manager role request post.listAll", function (done) {
            let fakeRoute = {
                    listAll: () => {
                        return "listAll";
                    },
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeNotApp = {
                    getModule: () => {
                        return fakeMod;
                    },
                };
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
                root: false,
                primaryRole: "manager",
                role: ["manager"],
            });
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            root: true,
                        },
                        {
                            auth: true,
                            role: ["manager"],
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post",
                    "listAll",
                    actionData
                );
            routerAction
                .exec(req)
                .then((result) => {
                    expect(result).to.deep.equal("listAll");
                    done();
                })
                .catch(done);
        });

        it("Auth request post.list", function (done) {
            let fakeRoute = {
                    list: () => {
                        return "list";
                    },
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeNotApp = {
                    getModule: () => {
                        return fakeMod;
                    },
                };
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
            });
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: true,
                        },
                        {
                            auth: false,
                        },
                        {
                            root: true,
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post",
                    "list",
                    actionData
                );
            routerAction
                .exec(req)
                .then((result) => {
                    expect(result).to.deep.equal("list");
                    done();
                })
                .catch(done);
        });

        it("Admin request post.list", function (done) {
            let fakeRoute = {
                    _list: () => {
                        return "_list";
                    },
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeNotApp = {
                    getModule: () => {
                        return fakeMod;
                    },
                };
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
                root: true,
                primaryRole: DEFAULT_USER_ROLE_FOR_ROOT,
                role: [DEFAULT_USER_ROLE_FOR_ROOT],
            });
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: false,
                        },
                        {
                            root: true,
                        },
                        {
                            auth: true,
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post",
                    "list",
                    actionData
                );
            routerAction
                .exec(req)
                .then((result) => {
                    expect(result).to.deep.equal("_list");
                    done();
                })
                .catch(done);
        });

        it("Admin request post.list with actionName override", function (done) {
            let fakeRoute = {
                    manager_listAll: () => {
                        return "manager_listAll";
                    },
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeNotApp = {
                    report(e) {
                        done(e);
                    },
                    getModule: () => {
                        return fakeMod;
                    },
                };
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
                root: true,
                primaryRole: DEFAULT_USER_ROLE_FOR_ROOT,
                role: [DEFAULT_USER_ROLE_FOR_ROOT],
            });
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: false,
                        },
                        {
                            root: true,
                            actionName: "manager_listAll",
                        },
                        {
                            auth: true,
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post",
                    "list",
                    actionData
                );
            routerAction
                .exec(req)
                .then((result) => {
                    expect(result).to.deep.equal("manager_listAll");
                    done();
                })
                .catch(done);
        });

        it("Admin request post.list with actionPrefix override", function (done) {
            let fakeRoute = {
                    __listAll: () => {
                        return "__listAll";
                    },
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeNotApp = {
                    report(e) {
                        done(e);
                    },
                    getModule: () => {
                        return fakeMod;
                    },
                };
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
                root: true,
                primaryRole: DEFAULT_USER_ROLE_FOR_ROOT,
                role: [DEFAULT_USER_ROLE_FOR_ROOT],
            });
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: false,
                        },
                        {
                            root: true,
                            actionPrefix: "__",
                        },
                        {
                            auth: true,
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post",
                    "listAll",
                    actionData
                );
            routerAction
                .exec(req)
                .then((result) => {
                    expect(result).to.deep.equal("__listAll");
                    done();
                })
                .catch(done);
        });

        it("Auth request post.list with actionPrefix override", function (done) {
            let fakeRoute = {
                    __list: () => {
                        return "__list";
                    },
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeNotApp = {
                    report(e) {
                        done(e);
                    },
                    getModule: () => {
                        return fakeMod;
                    },
                };
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
            });
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: false,
                        },
                        {
                            root: true,
                        },
                        {
                            auth: true,
                            actionPrefix: "__",
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post",
                    "list",
                    actionData
                );
            routerAction
                .exec(req)
                .then((result) => {
                    expect(result).to.deep.equal("__list");
                    done();
                })
                .catch(done);
        });

        it("Auth request post.list with actionName override", function (done) {
            let fakeRoute = {
                    manager_listAll: () => {
                        return "manager_listAll";
                    },
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeNotApp = {
                    report(e) {
                        done(e);
                    },
                    getModule: () => {
                        return fakeMod;
                    },
                };
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
            });
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: false,
                        },
                        {
                            root: true,
                        },
                        {
                            auth: true,
                            actionName: "manager_listAll",
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post",
                    "list",
                    actionData
                );
            routerAction
                .exec(req)
                .then((result) => {
                    expect(result).to.deep.equal("manager_listAll");
                    done();
                })
                .catch(done);
        });

        it("Auth with manager role request post.list with actionPrefix override", function (done) {
            let fakeRoute = {
                    __list: () => {
                        return "__list";
                    },
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeNotApp = {
                    report(e) {
                        done(e);
                    },
                    getModule: () => {
                        return fakeMod;
                    },
                };
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
                root: false,
                role: ["manager"],
                primaryRole: "manager",
            });

            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: false,
                        },
                        {
                            root: true,
                        },
                        {
                            auth: true,
                            role: "manager",
                            actionPrefix: "__",
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post",
                    "list",
                    actionData
                );
            routerAction
                .exec(req, false, done)
                .then((result) => {
                    expect(result).to.deep.equal("__list");
                    done();
                })
                .catch(done);
        });

        it("Auth with manager role request post.list with actionName override", async () => {
            let fakeRoute = {
                    manager_listAll: () => {
                        return "manager_listAll";
                    },
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeNotApp = {
                    report(e) {
                        throw e;
                    },
                    getModule: () => {
                        return fakeMod;
                    },
                };
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: false,
                        },
                        {
                            root: true,
                        },
                        {
                            auth: true,
                            role: "manager",
                            actionName: "manager_listAll",
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post",
                    "list",
                    actionData
                );
            const result = await routerAction.exec(req, {}, (e) => {
                throw e;
            });
            expect(result).to.deep.equal("manager_listAll");
        });

        it("Wrong modelName", function (done) {
            let fakeRoute = {
                    manager_listAll: () => {
                        return "manager_listAll";
                    },
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeNotApp = {
                    report(e) {
                        done(e);
                    },
                    getModule: () => {
                        return null;
                    },
                };
            let req = {
                    get() {},
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            auth: false,
                        },
                        {
                            root: true,
                        },
                        {
                            auth: true,
                            role: "manager",
                            actionName: "manager_listAll",
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeNotApp,
                    "not-user",
                    "post1",
                    "listasdf",
                    actionData
                );

            routerAction.exec(req, {}, (err) => {
                expect(err).to.be.instanceof(Error);
                done();
            });
        });

        it("Wrong rule", function () {
            let reported = false;
            notAppIdentity.identity = require("./fakes").fakeIdentity({
                auth: true,
                root: false,
                role: ["user", "confirmed"],
                primaryRole: "manager",
            });
            let req = {},
                actionData = {
                    method: "get",
                    rules: [
                        {
                            root: true,
                        },
                        {
                            auth: true,
                            role: "manager",
                            actionName: "manager_listAll",
                        },
                    ],
                },
                routerAction = new notRoute(
                    {
                        report(e) {
                            console.error(e);
                            reported = true;
                        },
                        getModule() {},
                    },
                    "not-user",
                    "post",
                    "list",
                    actionData
                );
            routerAction.exec(req, false, (err) => {
                expect(err).to.be.instanceof(Error);
                expect(err.message).to.be.deep.equal(
                    "rule for router not found; not-user; post"
                );
            });
            expect(reported).to.be.false;
        });

        it("Route is not runnable", function () {
            let fakeRoute = {
                    list: "not runnable string",
                },
                fakeMod = {
                    getRoute: () => {
                        return fakeRoute;
                    },
                },
                fakeApp = {
                    getModule() {
                        return fakeMod;
                    },
                    report() {},
                },
                req = {
                    session: {
                        user: true,
                        role: "user",
                    },
                },
                actionData = {
                    method: "get",
                    rules: [
                        {
                            root: true,
                        },
                        {
                            auth: true,
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeApp,
                    "not-user",
                    "post",
                    "list",
                    actionData
                );
            routerAction.exec(req, false, (err) => {
                console.error(err);
                expect(err).to.instanceof(HttpError);
                expect(err.status).to.be.equal(404);
                expect(err.message.indexOf("route not found")).to.be.equal(0);
            });
        });

        it("Exception throwned", function () {
            let throwned = false;
            let fakeApp = {
                    getModule: false,
                    report() {
                        throwned = true;
                    },
                },
                req = {},
                actionData = {
                    method: "get",
                    rules: [
                        {
                            root: true,
                        },
                        {
                            auth: true,
                        },
                    ],
                },
                routerAction = new notRoute(
                    fakeApp,
                    "not-user",
                    "post",
                    "list",
                    actionData
                );
            routerAction.exec(req, false, () => {});
            expect(throwned).to.be.true;
        });
    });

    describe("actionAvailableByRule", function () {
        it('rules[{auth:true,role:"client"},{auth:false}] X user(auth:true) = null', function () {
            const action = {
                    rules: [
                        {
                            auth: true,
                            role: "client",
                        },
                        {
                            auth: false,
                        },
                    ],
                },
                user = {
                    auth: true,
                };
            const role = notRoute.actionAvailableByRule(action, user);
            expect(role).to.be.null;
        });

        it('rules[{auth:true,role:"client"},{auth:true}] X user(auth:false) = {auth:false}', function () {
            const action = {
                    rules: [
                        {
                            auth: true,
                            role: "client",
                        },
                        {
                            auth: false,
                        },
                    ],
                },
                user = {
                    auth: false,
                };
            const role = notRoute.actionAvailableByRule(action, user);
            expect(role).to.be.deep.equal({
                auth: false,
            });
        });

        it("action({root:true,fields:[]}]) X user(root:true) = {root:true, fields:[]}", function () {
            const action = {
                    root: true,
                    fields: ["some", "foo", "bar"],
                },
                user = {
                    root: true,
                };
            const role = notRoute.actionAvailableByRule(action, user);
            expect(role).to.be.deep.equal({
                root: true,
                fields: ["some", "foo", "bar"],
            });
        });

        it("action - false X user(root:true) = null", function () {
            const action = false,
                user = {
                    root: true,
                };
            const role = notRoute.actionAvailableByRule(action, user);
            expect(role).to.be.null;
        });

        it("action(auth:true) X user(auth:false) = null", function () {
            const action = {
                    auth: true,
                },
                user = {
                    auth: false,
                };
            const role = notRoute.actionAvailableByRule(action, user);
            expect(role).to.be.null;
        });
    });
});

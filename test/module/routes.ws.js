const path = require("path");
const notModuleRegistratorRoutesWS = require("../../src/manifest/registrator/routes.ws");

module.exports = ({ expect }) => {
    describe("notModuleRegistratorRoutesWS", function () {
        describe("run", function () {
            it("notApp exists", function () {
                const res = [];
                const ctx = {
                    registerServers() {
                        res.push("servers");
                    },
                    registerClients() {
                        res.push("clients");
                    },
                };
                const nModule = {
                    appIsSet() {
                        return true;
                    },
                };
                notModuleRegistratorRoutesWS.run.call(ctx, {
                    nModule,
                    wsRoute: {},
                    wsRouteName: "wsRouteName",
                });
                expect(res.sort()).to.be.deep.equal(
                    ["servers", "clients"].sort()
                );
            });

            it("notApp doesnt exists", function () {
                const res = [];
                const ctx = {
                    registerServers() {
                        res.push("servers");
                    },
                    registerClients() {
                        res.push("clients");
                    },
                };
                const nModule = {
                    appIsSet() {
                        return false;
                    },
                };
                notModuleRegistratorRoutesWS.run.call(ctx, {
                    nModule,
                    wsRoute: {},
                    wsRouteName: "wsRouteName",
                });
                expect(res).to.be.deep.equal([]);
            });
        });

        describe("registerClients", function () {
            it("plain run", function (done) {
                const ctx = {
                    registerCollectionType({ collectionType }) {
                        expect(collectionType).to.be.equal("clients");
                        done();
                    },
                };
                const nModule = {};
                notModuleRegistratorRoutesWS.registerClients.call(ctx, {
                    nModule,
                    wsRoute: {},
                    wsRouteName: "wsRouteName",
                });
            });
        });

        describe("registerServers", function () {
            it("plain run", function (done) {
                const ctx = {
                    registerCollectionType({ collectionType }) {
                        expect(collectionType).to.be.equal("servers");
                        done();
                    },
                };
                const nModule = {};
                notModuleRegistratorRoutesWS.registerServers.call(ctx, {
                    nModule,
                    wsRoute: {},
                    wsRouteName: "wsRouteName",
                });
            });
        });

        describe("registerCollectionType", function () {
            it("collectionType exists", function (done) {
                const ctx = {
                    registerCollectionItem({
                        nModule,
                        wsRoute,
                        wsRouteName,
                        collectionType,
                        collectionName,
                    }) {
                        expect(collectionType).to.be.equal("servers");
                        expect(collectionName).to.be.equal("main");
                        done();
                    },
                };
                const param = {
                    nModule: {},
                    wsRoute: {
                        servers: {
                            main: {},
                        },
                    },
                    wsRouteName: "wsRouteName",
                    collectionType: "servers",
                };
                notModuleRegistratorRoutesWS.registerCollectionType.call(
                    ctx,
                    param
                );
            });

            it("collectionType doesnt exists", function () {
                const ctx = {};
                const param = {
                    nModule: {},
                    wsRoute: {},
                    wsRouteName: "wsRouteName",
                    collectionType: "servers",
                };
                const res =
                    notModuleRegistratorRoutesWS.registerCollectionType.call(
                        ctx,
                        param
                    );
                expect(res).to.be.false;
            });
        });

        describe("registerCollectionItem", function () {
            it("registerCollectionItem exists", function (done) {
                const ctx = {
                    registerEndPoints({
                        nModule,
                        wsRoute,
                        wsRouteName,
                        collectionType,
                        collectionName,
                        collection,
                    }) {
                        expect(collectionType).to.be.equal("servers");
                        expect(collectionName).to.be.equal("main");
                        expect(typeof collection.getLogic).to.be.equal(
                            "function"
                        );
                        expect(typeof collection.getLogicFile).to.be.equal(
                            "function"
                        );
                        expect(typeof collection.getModel).to.be.equal(
                            "function"
                        );
                        expect(typeof collection.getModelFile).to.be.equal(
                            "function"
                        );
                        expect(typeof collection.getModelSchema).to.be.equal(
                            "function"
                        );
                        expect(typeof collection.getModule).to.be.equal(
                            "function"
                        );
                        done();
                    },
                };
                const param = {
                    nModule: {
                        getApp() {
                            return {
                                getModel() {},
                                getModelFile() {},
                                getModelSchema() {},
                                getLogic() {},
                                getLogicFile() {},
                                getModule() {},
                            };
                        },
                    },
                    wsRoute: {
                        servers: {
                            main: {},
                        },
                    },
                    wsRouteName: "wsRouteName",
                    collectionType: "servers",
                    collectionName: "main",
                };
                notModuleRegistratorRoutesWS.registerCollectionItem.call(
                    ctx,
                    param
                );
            });
        });

        describe("addEntityEndPointsOfType", function () {
            it("no exceptions", function (done) {
                const param = {
                    nModule: {
                        setRouteWS({
                            collectionType,
                            collectionName,
                            endPointType,
                            wsRouteName,
                            action,
                            func,
                        }) {
                            expect(typeof func).to.be.equal("function");
                            expect(action).to.be.equal("get");
                            expect(wsRouteName).to.be.equal("user");
                            expect(endPointType).to.be.equal("request");
                            expect(collectionName).to.be.equal("main");
                            expect(collectionType).to.be.equal("clients");
                            done();
                        },
                    },
                    endPoints: {
                        get() {},
                    },
                    collectionType: "clients",
                    collectionName: "main",
                    wsRouteName: "user",
                    endPointType: "request",
                };
                notModuleRegistratorRoutesWS.addEntityEndPointsOfType(param);
            });
        });

        describe("registerEndPoints", function () {
            it("no exceptions", function (done) {
                const param = {
                    nModule: {
                        createEmptyIfNotExistsRouteWSType() {},
                        setRouteWS({
                            collectionType,
                            collectionName,
                            endPointType,
                            wsRouteName,
                            action,
                            func,
                        }) {
                            expect(typeof func).to.be.equal("function");
                            expect(action).to.be.equal("get");
                            expect(wsRouteName).to.be.equal("user");
                            expect(endPointType).to.be.equal("request");
                            expect(collectionName).to.be.equal("main");
                            expect(collectionType).to.be.equal("clients");
                            done();
                        },
                    },
                    collection: {
                        request: {
                            get() {},
                        },
                    },
                    collectionType: "clients",
                    collectionName: "main",
                    wsRouteName: "user",
                    endPointType: "request",
                };
                notModuleRegistratorRoutesWS.registerEndPoints(param);
            });
        });
    });
};

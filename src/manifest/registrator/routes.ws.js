const { mapBind, objHas } = require("../../common");

/**
 * List of methods to be binded from notApp to routes and WS end-points
 * @constant
 * @type {Array<string>}
 */
const WS_ROUTE_BINDINGS_LIST = [
    "getLogic",
    "getLogicFile",
    "getModel",
    "getModelFile",
    "getModelSchema",
    "getModule",
];

module.exports = class notModuleRegistratorRoutesWS {
    static run({ nModule, wsRoute, wsRouteName }) {
        if (nModule.appIsSet()) {
            const input = {
                nModule,
                wsRoute,
                wsRouteName,
            };
            this.registerServers(input);
            this.registerClients(input);
        }
    }

    static registerServers(input) {
        this.registerCollectionType({
            ...input,
            collectionType: "servers",
        });
    }

    static registerClients(input) {
        this.registerCollectionType({
            ...input,
            collectionType: "clients",
        });
    }

    static registerCollectionType({
        nModule,
        wsRoute,
        wsRouteName,
        collectionType,
    }) {
        if (!objHas(wsRoute, collectionType)) {
            return false;
        }
        Object.keys(wsRoute[collectionType]).forEach((collectionName) =>
            this.registerCollectionItem({
                nModule,
                wsRoute,
                wsRouteName,
                collectionType,
                collectionName,
            })
        );
        return true;
    }

    static registerCollectionItem({
        nModule,
        wsRoute,
        wsRouteName,
        collectionType,
        collectionName,
    }) {
        const collection = wsRoute[collectionType][collectionName];
        mapBind(nModule.getApp(), collection, WS_ROUTE_BINDINGS_LIST);
        this.registerEndPoints({
            nModule,
            wsRoute,
            wsRouteName,
            collectionType,
            collectionName,
            collection,
        });
    }

    static registerEndPoints({
        nModule,
        wsRouteName,
        collectionType,
        collectionName,
        collection,
    }) {
        Object.keys(collection).forEach((endPointType) => {
            const endPoints = collection[endPointType];
            //creating deep object structure if not exists
            nModule.createEmptyIfNotExistsRouteWSType({
                collectionType,
                collectionName,
                endPointType,
            });
            //
            notModuleRegistratorRoutesWS.addEntityEndPointsOfType({
                nModule,
                endPoints,
                collectionType,
                collectionName,
                endPointType,
                wsRouteName,
            });
        });
    }

    static addEntityEndPointsOfType({
        nModule,
        endPoints,
        collectionType,
        collectionName,
        endPointType,
        wsRouteName,
    }) {
        Object.keys(endPoints).forEach((endPointName) => {
            nModule.setRouteWS({
                collectionType,
                collectionName,
                endPointType,
                wsRouteName,
                action: endPointName,
                func: endPoints[endPointName],
            });
        });
    }
};

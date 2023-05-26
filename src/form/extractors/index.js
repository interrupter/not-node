/**
 * Extracts values from different input sources
 */
module.exports = {
    activeUserId: require("./activeUserId.js"),
    activeUserModelName: require("./activeUserModelName.js"),
    fromBody: require("./fromBody.js"),
    fromParams: require("./fromParams.js"),
    fromQuery: require("./fromQuery.js"),
};

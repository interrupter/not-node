const { executeObjectFunction } = require("../common");

let ADDITIONAL = {};

module.exports.init = (val) => {
    if (typeof val === "object") {
        ADDITIONAL = { ...val };
    }
};

module.exports.run = (path, params) => {
    return executeObjectFunction(ADDITIONAL, path, [params]);
};

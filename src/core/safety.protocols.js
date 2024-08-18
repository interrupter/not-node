const { ACTION_SIGNATURES } = require("../auth/const");

module.exports.ownerRootAdmin = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: ["@owner", "root", "admin"],
    [ACTION_SIGNATURES.READ]: ["@owner", "root", "admin"],
    [ACTION_SIGNATURES.UPDATE]: ["@owner", "root", "admin"],
    [ACTION_SIGNATURES.DELETE]: ["@owner", "root", "admin"],
});

module.exports.systemManageable = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: ["@system"],
    [ACTION_SIGNATURES.READ]: ["@system", "@owner", "root", "admin"],
    [ACTION_SIGNATURES.UPDATE]: ["@system"],
    [ACTION_SIGNATURES.DELETE]: ["@system"],
});

module.exports.publicReadable = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: [],
    [ACTION_SIGNATURES.READ]: ["@*"],
    [ACTION_SIGNATURES.UPDATE]: [],
    [ACTION_SIGNATURES.DELETE]: [],
});

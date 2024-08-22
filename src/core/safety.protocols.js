const { ACTION_SIGNATURES } = require("../auth/const");
/**
 * owner can manage own documents
 * root, admin - any own and any of client, user, guest
 */
module.exports.ownerRootAdmin = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: ["@owner", "root", "admin"],
    [ACTION_SIGNATURES.READ]: ["@owner", "root", "admin"],
    [ACTION_SIGNATURES.UPDATE]: ["@owner", "root", "admin"],
    [ACTION_SIGNATURES.DELETE]: ["@owner", "root", "admin"],
});

/**
 *  same as above but client can create new documents
 */
module.exports.ownerRootAdminCRUD_clientC = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: ["@owner", "root", "admin", "client"],
    [ACTION_SIGNATURES.READ]: ["@owner", "root", "admin"],
    [ACTION_SIGNATURES.UPDATE]: ["@owner", "root", "admin"],
    [ACTION_SIGNATURES.DELETE]: ["@owner", "root", "admin"],
});

/**
 * system creates some docs maybe with ownage delegated to other user
 * owner, root, admin could read
 */
module.exports.systemManageable = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: ["@system"],
    [ACTION_SIGNATURES.READ]: ["@system", "@owner", "root", "admin"],
    [ACTION_SIGNATURES.UPDATE]: ["@system"],
    [ACTION_SIGNATURES.DELETE]: ["@system"],
});

/**
 * anyone could read, public readable data
 */
module.exports.publicReadable = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: [],
    [ACTION_SIGNATURES.READ]: ["@*"],
    [ACTION_SIGNATURES.UPDATE]: [],
    [ACTION_SIGNATURES.DELETE]: [],
});

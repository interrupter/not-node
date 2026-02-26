const { ACTION_SIGNATURES, ACCESS_SPECIALS } = require("../auth/const");

module.exports.rootAdmin = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: ["root", "admin"],
    [ACTION_SIGNATURES.READ]: ["root", "admin"],
    [ACTION_SIGNATURES.UPDATE]: ["root", "admin"],
    [ACTION_SIGNATURES.DELETE]: ["root", "admin"],
});

module.exports.rootAdminCRUD_ownerR = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: ["root", "admin"],
    [ACTION_SIGNATURES.READ]: ["root", "admin", ACCESS_SPECIALS.OWNER],
    [ACTION_SIGNATURES.UPDATE]: ["root", "admin"],
    [ACTION_SIGNATURES.DELETE]: ["root", "admin"],
});

module.exports.rootAdminCRUD_allR = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: ["root", "admin"],
    [ACTION_SIGNATURES.READ]: ["root", "admin", ACCESS_SPECIALS.ALL],
    [ACTION_SIGNATURES.UPDATE]: ["root", "admin"],
    [ACTION_SIGNATURES.DELETE]: ["root", "admin"],
});

/**
 * owner can manage own documents
 * root, admin - any own and any of client, user, guest
 */
module.exports.ownerRootAdmin = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: [ACCESS_SPECIALS.OWNER, "root", "admin"],
    [ACTION_SIGNATURES.READ]: [ACCESS_SPECIALS.OWNER, "root", "admin"],
    [ACTION_SIGNATURES.UPDATE]: [ACCESS_SPECIALS.OWNER, "root", "admin"],
    [ACTION_SIGNATURES.DELETE]: [ACCESS_SPECIALS.OWNER, "root", "admin"],
});

/**
 *  same as above but client can create new documents
 */
module.exports.ownerRootAdminCRUD_clientC = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: [
        ACCESS_SPECIALS.OWNER,
        "root",
        "admin",
        "client",
    ],
    [ACTION_SIGNATURES.READ]: [ACCESS_SPECIALS.OWNER, "root", "admin"],
    [ACTION_SIGNATURES.UPDATE]: [ACCESS_SPECIALS.OWNER, "root", "admin"],
    [ACTION_SIGNATURES.DELETE]: [ACCESS_SPECIALS.OWNER, "root", "admin"],
});

/**
 * system creates some docs maybe with ownage delegated to other user
 * owner, root, admin could read
 */
module.exports.systemManageable = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: [ACCESS_SPECIALS.SYSTEM],
    [ACTION_SIGNATURES.READ]: [
        ACCESS_SPECIALS.SYSTEM,
        ACCESS_SPECIALS.OWNER,
        "root",
        "admin",
    ],
    [ACTION_SIGNATURES.UPDATE]: [ACCESS_SPECIALS.SYSTEM],
    [ACTION_SIGNATURES.DELETE]: [ACCESS_SPECIALS.SYSTEM],
});

module.exports.systemManageableSecret = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: [ACCESS_SPECIALS.SYSTEM],
    [ACTION_SIGNATURES.READ]: [ACCESS_SPECIALS.SYSTEM],
    [ACTION_SIGNATURES.UPDATE]: [ACCESS_SPECIALS.SYSTEM],
    [ACTION_SIGNATURES.DELETE]: [ACCESS_SPECIALS.SYSTEM],
});

/**
 * anyone could read, public readable data
 */
module.exports.publicReadable = Object.freeze({
    [ACTION_SIGNATURES.CREATE]: [],
    [ACTION_SIGNATURES.READ]: [ACCESS_SPECIALS.ALL],
    [ACTION_SIGNATURES.UPDATE]: [],
    [ACTION_SIGNATURES.DELETE]: [],
});

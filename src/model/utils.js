const { findSignature } = require("../common");

const INSERT_SIGNATURE = {
    acknowledged: true,
    modifiedCount: 0,
    upsertedId: {},
    upsertedCount: 1,
    matchedCount: 0,
};

const SIGNATURES = {
    INSERT: [INSERT_SIGNATURE],
    UPDATE: [],
    DELETE: [],
};

function insertResponseSuccess(res, count = 1) {
    const ind = findSignature(res, SIGNATURES.INSERT);
    if (ind === -1) {
        return false;
    }
    return SIGNATURES.INSERT[ind].upsertedCount === count;
}

module.exports.insertResponseSuccess = insertResponseSuccess;

/**
 * checking result of modification queries to ensure that changes were made
 */
function updateResponseSuccess(res, count = 1) {
    if (res) {
        const responseList = Object.keys(res);
        if (responseList.includes("ok")) {
            return res.ok === 1 && res.n === count;
        } else {
            return res.matchedCount === count && res.acknowledged;
        }
    } else {
        return false;
    }
}
module.exports.updateResponseSuccess = updateResponseSuccess;

/**
 * checking result of modification queries to ensure that changes were made
 */
function deleteResponseSuccess(res, count = 1) {
    if (res) {
        const responseList = Object.keys(res);
        if (responseList.includes("ok")) {
            return res.ok === 1 && res.n === count;
        } else {
            return res.deletedCount === count;
        }
    } else {
        return false;
    }
}
module.exports.deleteResponseSuccess = deleteResponseSuccess;

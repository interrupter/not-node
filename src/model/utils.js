const { compareObjectSignatures } = require("../common");

function getBaseResult() {
    return {
        acknowledged: true,
    };
}

function createInsertManySuccessSignature(count) {
    if (count > 0) {
        return Object.assign(
            {
                insertedCount: count,
            },
            getBaseResult()
        );
    } else {
        return Object.assign({}, getBaseResult());
    }
}

function createInsertOneSuccessSignature() {
    return Object.assign({}, getBaseResult());
}

function createUpdateManySuccessSignature(count) {
    return Object.assign(
        {
            matchedCount: count,
            upsertedCount: 0,
            modifiedCount: 0,
        },
        getBaseResult()
    );
}

function createDeleteManySuccessSignature(count) {
    if (count > 0) {
        return Object.assign(
            {
                deletedCount: count,
            },
            getBaseResult()
        );
    } else {
        return Object.assign({}, getBaseResult());
    }
}

function insertResponseSuccess(res, count = 1) {
    const targetSignature =
        count === 1
            ? createInsertOneSuccessSignature()
            : createInsertManySuccessSignature(count);
    return compareObjectSignatures(res, targetSignature, false, true, true);
}

module.exports.insertResponseSuccess = insertResponseSuccess;

/**
 * checking result of modification queries to ensure that changes were made
 */
function updateResponseSuccess(res, count = 1) {
    const targetSignature = createUpdateManySuccessSignature(count);
    if (compareObjectSignatures(res, targetSignature, false, true)) {
        return res.upsertedCount + res.modifiedCount === count;
    } else {
        return false;
    }
}
module.exports.updateResponseSuccess = updateResponseSuccess;

function deleteManyResponseSuccess(res, count) {
    const targetSignature = createDeleteManySuccessSignature(count);
    return compareObjectSignatures(res, targetSignature, true, true, true);
}

module.exports.deleteManyResponseSuccess = deleteManyResponseSuccess;

/**
 * checking result of modification queries to ensure that changes were made
 */
function deleteResponseSuccess(res, count = 1) {
    return deleteManyResponseSuccess(res, count);
}
module.exports.deleteResponseSuccess = deleteResponseSuccess;

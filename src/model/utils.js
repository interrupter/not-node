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

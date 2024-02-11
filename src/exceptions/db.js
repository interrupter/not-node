const { notError, notRequestError } = require("not-error/src/index.cjs");

//delete wasnt successful, or error, or count of deleted documents dont match requested
class DBExceptionDeleteWasNotSuccessful extends notError {
    constructor(result) {
        super("DB Delete Was Not Successful", result);
    }
}

module.exports.DBExceptionDeleteWasNotSuccessful =
    DBExceptionDeleteWasNotSuccessful;

//delete wasnt successful, bc document is owned by another user
class DBExceptionDocumentIsNotOwnerByActiveUser extends notRequestError {
    constructor({ params = {}, cause = null } = {}) {
        super(
            "DB Only Owners Could Delete their documents",
            { code: 403, ...params },
            cause
        );
    }
}
module.exports.DBExceptionDocumentIsNotOwnerByActiveUser =
    DBExceptionDocumentIsNotOwnerByActiveUser;

class DBExceptionDocumentIsNotFound extends notRequestError {
    constructor({ params = {}, cause = null } = {}) {
        super("DB document is not found", { code: 404, ...params }, cause);
    }
}
module.exports.DBExceptionDocumentIsNotFound = DBExceptionDocumentIsNotFound;

class DBExceptionUpdateOneWasNotSuccessful extends notRequestError {
    constructor({ params = {}, cause = null } = {}) {
        super(
            "DB Update One Was Not Successful",
            { code: 505, ...params },
            cause
        );
    }
}
module.exports.DBExceptionUpdateOneWasNotSuccessful =
    DBExceptionUpdateOneWasNotSuccessful;

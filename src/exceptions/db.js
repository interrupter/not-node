const { notRequestError } = require("not-error");

//delete wasnt successful, or error, or count of deleted documents dont match requested
class DBExceptionDeleteWasNotSuccessful extends notRequestError {
    constructor({ params = {}, cause = null }) {
        super("DB Delete Was Not Successful", { code: 505, ...params }, cause);
    }
}
module.exports.DBExceptionDeleteWasNotSuccessful =
    DBExceptionDeleteWasNotSuccessful;

//delete wasnt successful, bc document is owned by another user
class DBExceptionDocumentIsNotOwnerByActiveUser extends notRequestError {
    constructor({ params = {}, cause = null }) {
        super(
            "DB Only Owners Could Delete their documents",
            { code: 403, ...params },
            cause
        );
    }
}
module.exports.DBExceptionDocumentIsNotOwnerByActiveUser =
    DBExceptionDocumentIsNotOwnerByActiveUser;

const { notRequestError } = require("not-error");

//https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses

//form of request is not valid
class HttpExceptionBadRequest extends notRequestError {
    constructor({ params = {}, cause = null } = {}) {
        super("Bad Request", { code: 400, ...params }, cause);
    }
}
module.exports.HttpExceptionBadRequest = HttpExceptionBadRequest;

//user is not authenticated
class HttpExceptionUnauthorized extends notRequestError {
    constructor({ params = {}, cause = null } = {}) {
        super("Unauthorized", { code: 401, ...params }, cause);
    }
}
module.exports.HttpExceptionUnauthorized = HttpExceptionUnauthorized;

//user is too poor to go there
class HttpExceptionPaymentRequired extends notRequestError {
    constructor({ params = {}, cause = null } = {}) {
        super("Payment Required", { code: 402, ...params }, cause);
    }
}
module.exports.HttpExceptionPaymentRequired = HttpExceptionPaymentRequired;

//user identity is known, but he has no right to go there
class HttpExceptionForbidden extends notRequestError {
    constructor({ params = {}, cause = null } = {}) {
        super("Forbidden", { code: 403, ...params }, cause);
    }
}
module.exports.HttpExceptionForbidden = HttpExceptionForbidden;

//requested address is not exists
class HttpExceptionNotFound extends notRequestError {
    constructor({ params = {}, cause = null } = {}) {
        super("Not Found", { code: 404, ...params }, cause);
    }
}
module.exports.HttpExceptionNotFound = HttpExceptionNotFound;

const log = require("not-log")(module, "Auth");

module.exports = function (rule, url = "") {
    if (Object.prototype.hasOwnProperty.call(rule, "user")) {
        log.error(
            `Missformed rule, field "user" is not allowed, use "auth" instead: ${url}`
        );
    }
    if (Object.prototype.hasOwnProperty.call(rule, "admin")) {
        log.error(
            `Missformed rule, field "admin" is obsolete, use "root" instead: ${url}`
        );
    }
};

const log = require("not-log")(module, "Auth");

const obsoleteRuleFields = function (rule, url = "") {
    if (Object.prototype.hasOwnProperty.call(rule, "user")) {
        log &&
            log.error(
                `Missformed rule, field "user" is not allowed, use "auth" instead: ${url}`
            );
    }
    if (Object.prototype.hasOwnProperty.call(rule, "admin")) {
        log &&
            log.error(
                `Missformed rule, field "admin" is obsolete, use "root" instead: ${url}`
            );
    }
};

const obsoleteActionFields = function (action, url = "") {
    if (!Object.prototype.hasOwnProperty.call(action, "rules")) {
        log &&
            log.error(
                `Missformed action, access rule should be moved to object inside property 'rules' (array<object>): ${url}`
            );
    }
};

module.exports = {
    obsoleteRuleFields,
    obsoleteActionFields,
};

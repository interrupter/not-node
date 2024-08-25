const notFilter = require("not-filter");
const notError = require("not-error/src/error.node.cjs");

module.exports = (prepared /*, req*/) => {
    if (!prepared?.identity?.root && !prepared?.identity?.admin) {
        if (prepared.identity?.uid) {
            prepared.filter = notFilter.filter.modifyRules(
                prepared.filter || {},
                {
                    owner: prepared.identity.uid,
                }
            );
        } else {
            throw new notError("User identity has no uid in it", {
                sid: prepared.identity?.sid,
            });
        }
    }
    return prepared;
};

const USER_MODEL_NAME = "User";
const notError = require("not-error/src/error.node.cjs");

module.exports = (prepared /*, req*/) => {
    if (!prepared?.identity?.root && !prepared?.identity?.admin) {
        if (prepared.identity?.uid) {
            prepared.data.owner = prepared.identity?.uid;
            prepared.data.ownerModel = USER_MODEL_NAME;
        } else {
            throw new notError("User identity has no uid in it", {
                sid: prepared.identity?.sid,
            });
        }
    }
    return prepared;
};

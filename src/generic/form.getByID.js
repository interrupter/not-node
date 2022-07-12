//DB related validation tools
const Form = require("../form/form");
const { firstLetterToUpper, firstLetterToLower } = require("../common");
//not-node
const { getIP } = require("../auth");
//form
const FIELDS = [
    ["targetID", { required: true }, "not-node//ID"],
    ["activeUserId", { required: true }, "not-node//objectId"],
    ["activeUser", "not-node//requiredObject"],
    ["ip", "not-node//ip"],
];

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName }) => {
    const FORM_NAME = `${MODULE_NAME}:${firstLetterToUpper(actionName)}Form`;
    return class extends Form {
        constructor({ app }) {
            super({ FIELDS, FORM_NAME, app });
        }

        extract(req) {
            const incField = `${firstLetterToLower(MODEL_NAME)}ID`;
            return {
                targetId: req.params[incField],
                activeUser: req.user,
                activeUserId: req.user._id,
                ip: getIP(req),
            };
        }
    };
};

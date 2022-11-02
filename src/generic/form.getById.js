//DB related validation tools
const Form = require("../form/form");
const { firstLetterToUpper } = require("../common");
//not-node
const { getIP } = require("../auth");
//form
const FIELDS = [
    ["targetId", { required: true }, "not-node//objectId"],
    ["activeUserId", { required: true }, "not-node//objectId"],
    ["activeUser", "not-node//requiredObject"],
    ["ip", "not-node//ip"],
];

module.exports = ({ MODULE_NAME, actionName }) => {
    const FORM_NAME = `${MODULE_NAME}:${firstLetterToUpper(actionName)}Form`;
    return class extends Form {
        constructor({ app }) {
            super({ FIELDS, FORM_NAME, app });
        }

        extract(req) {
            return {
                targetId: req.params._id,
                activeUser: req?.user,
                activeUserId: req?.user._id,
                ip: getIP(req),
            };
        }
    };
};

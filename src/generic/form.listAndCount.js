const Form = require("../form/form");
const { firstLetterToUpper } = require("../common");
const { getIP } = require("../auth");
const notFilter = require("not-filter");
const getApp = require("../getApp");

const FIELDS = [
    ["query", `not-filter//_filterQuery`],
    ["activeUserId", { required: true }, "not-node//objectId"],
    ["activeUser", "not-node//requiredObject"],
    ["ip", "not-node//ip"],
];

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName }) => {
    const FORM_NAME = `${MODULE_NAME}:${MODEL_NAME}:${firstLetterToUpper(
        actionName
    )}Form`;
    return class extends Form {
        constructor({ app }) {
            super({ FIELDS, FORM_NAME, app });
        }

        extract(req) {
            const thisSchema = getApp().getModelSchema(
                `${MODULE_NAME}//${MODEL_NAME}`
            );
            const { skip, size } = notFilter.pager.process(req), //skip,size
                sorter = notFilter.sorter.process(req, thisSchema),
                search = notFilter.search.process(req, thisSchema);
            let filter = notFilter.filter.process(req, thisSchema);

            if (!req.user.isRoot() && !req.user.isAdmin()) {
                filter = notFilter.filter.modifyRules(filter, {
                    owner: req.user._id,
                });
            }

            return {
                query: {
                    skip,
                    size,
                    sorter,
                    filter,
                    search,
                },
                activeUser: req?.user,
                activeUserId: req?.user._id,
                ip: getIP(req),
            };
        }
    };
};

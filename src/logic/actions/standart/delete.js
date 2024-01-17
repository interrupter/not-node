const { deleteResponseSuccess } = require("../../../model/utils.js");
const {
    DBExceptionDeleteWasNotSuccessful,
} = require("../../../exceptions/db.js");

module.exports = class DeleteAction {
    static async run(
        logic,
        actionName,
        { identity, defaultQueryById, targetId }
    ) {
        logic.logDebugAction(actionName, identity);

        const model = logic.getModel();
        const result = await model.findOneAndDelete(defaultQueryById);

        if (!deleteResponseSuccess(result)) {
            throw new DBExceptionDeleteWasNotSuccessful({
                params: {
                    result,
                    targetId,
                    query: defaultQueryById,
                    activeUserId: identity?.uid,
                    role: identity?.role,
                },
            });
        }
        logic.logAction(actionName, identity, {
            query: defaultQueryById,
        });
    }
};

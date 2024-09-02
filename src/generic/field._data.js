const Schema = require("mongoose").Schema;
const getApp = require("../getApp");
const { firstLetterToLower } = require("../common");

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName = "data" }) => {
    return {
        model: {
            type: Schema.Types.Mixed,
            required: true,
            validate: [
                {
                    validator(val) {
                        return getApp()
                            .getForm(`${MODULE_NAME}//_${actionName}`)
                            .run(val);
                    },
                    message: `${MODULE_NAME}:${firstLetterToLower(
                        MODEL_NAME
                    )}_data_is_not_valid`,
                },
            ],
        },
    };
};

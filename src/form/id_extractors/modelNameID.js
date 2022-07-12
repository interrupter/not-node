const { firstLetterToLower } = require("../../common");

module.exports = (form, req) => {
    const modelName = form.getModelName();
    if (typeof modelName === "string") {
        const idFieldName = `${firstLetterToLower(modelName)}ID`;
        return {
            name: "targetID",
            value: req.params[idFieldName],
        };
    }
    return undefined;
};

const { firstLetterToLower } = require("../../common");

module.exports = (form, req) => {
    const modelName = form.getModelName(req);
    if (typeof modelName === "string") {
        const idFieldName = `${firstLetterToLower(modelName)}ID`;
        return {
            name: idFieldName,
            value: req.params[idFieldName],
        };
    }
    return undefined;
};

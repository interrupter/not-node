//DB related validation tools
const Form = require("../form/form");

//form
const STANDART_FIELDS = [["identity", "not-node//identity"]];

module.exports = ({ MODULE_NAME, MODEL_NAME, actionName, FIELDS = [] }) => {
    return class extends Form {
        constructor(params) {
            super({
                ...params,
                MODULE_NAME,
                MODEL_NAME,
                actionName,
                FIELDS: [...STANDART_FIELDS, ...FIELDS],
            });
        }
    };
};

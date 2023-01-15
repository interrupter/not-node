function collectData(inquirer, fields) {
    let defaultFields = [];
    ["ownerModel", "owner"].forEach((entry) => {
        if (fields.includes(entry)) defaultFields.push(entry);
    });
    return inquirer
        .prompt([
            {
                type: "checkbox",
                name: "filter",
                message: "Group auto-increment indexes by",
                choices: fields.map((name) => {
                    return {
                        name,
                        checked: defaultFields.includes(name),
                    };
                }),
                default: defaultFields,
                validate(answer) {
                    if (answer.length < 1) {
                        return "You must choose at least one field.";
                    }
                    return true;
                },
            },
        ])
        .then((answer) => {
            return answer.filter;
        });
}

export default (inquirer, modelConfig) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Model auto-increment field global?",
                default: true,
            },
        ])
        .then((answer) => {
            if (answer.enabled) {
                return collectData(inquirer, modelConfig.fields);
            } else {
                return false;
            }
        });
};

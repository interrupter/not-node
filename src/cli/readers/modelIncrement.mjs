import modelIncrementFilter from "./modelIncrementFilter.mjs";

async function collectData(inquirer, config) {
    const filter = await modelIncrementFilter(inquirer, config);
    if (filter) {
        return {
            options: {
                filter,
            },
        };
    }
    return {};
}

export default (inquirer, config) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Model should have auto-increment field?",
                default: false,
            },
        ])
        .then((answer) => {
            if (answer.enabled) {
                return collectData(inquirer, config);
            } else {
                return false;
            }
        });
};

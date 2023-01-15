function collectData(inquirer) {
    return inquirer.prompt([
        {
            type: "input",
            name: "private",
            message: "SSL private key",
        },
        {
            type: "input",
            name: "fullchain",
            message: "SSL fullchain",
        },
        {
            type: "input",
            name: "chain",
            message: "SSL chain",
        },
    ]);
}

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "SSL",
                default: false,
            },
        ])
        .then((answer) => {
            if (answer.enabled) {
                return collectData(inquirer);
            } else {
                return false;
            }
        });
};

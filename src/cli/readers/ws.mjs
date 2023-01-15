function collectData(inquirer) {
    return inquirer.prompt([
        {
            type: "input",
            name: "port",
            message: "WS port number",
            default: 33000,
        },
        {
            type: "config",
            name: "secure",
            message: "WS secure",
            default: true,
        },
    ]);
}

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Configure WS module `main` server connection?",
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

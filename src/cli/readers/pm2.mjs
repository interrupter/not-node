function collectData(inquirer) {
    return inquirer.prompt([
        {
            type: "confirm",
            name: "watch",
            message: "Watch & restart?",
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
                message: "Create pm2 environment configs set?",
                default: true,
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

function collectData(inquirer) {
    return inquirer.prompt([
        {
            type: "confirm",
            name: "http2",
            message: "Enable HTTP2?",
            default: true,
        },
        {
            type: "confirm",
            name: "http3",
            message: "Enable HTTP3?",
            default: false,
        },
        {
            type: "confirm",
            name: "ssl",
            message: "Enable SSL?",
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
                message: "Create NGINX configs set?",
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

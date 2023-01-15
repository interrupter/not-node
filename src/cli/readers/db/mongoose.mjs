const DEFAULT = {
    db: "test",
    host: "localhost",
    user: "",
    pass: "",
};

function collectData(inquirer) {
    return inquirer.prompt([
        {
            type: "input",
            name: "hostname",
            message: "MongoDB Hostname",
            default: DEFAULT.host,
        },
        {
            type: "input",
            name: "db",
            message: "MongoDB DB name",
            default: DEFAULT.db,
        },
        {
            type: "input",
            name: "user",
            message: "MongoDB User",
            default: DEFAULT.user,
        },
        {
            type: "password",
            mask: "*",
            name: "pass",
            message: "MongoDB Pass",
            default: DEFAULT.pass,
        },
        {
            type: "input",
            name: "authSource",
            message: "MongoDB authSource",
            default: "admin",
        },
    ]);
}

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Configure mongoose?",
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

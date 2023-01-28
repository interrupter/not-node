const DEFAULT = {
    db: "test",
    host: "localhost",
    user: "tester",
    pass: "test",
    authSource: "admin",
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
            default: DEFAULT.authSource,
        },
    ]);
}

function needToConfigure(inquirer) {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "configure",
                message: "Configure mongoose connection?",
                default: false,
            },
        ])
        .then((answer) => {
            if (answer.configure) {
                return collectData(inquirer);
            } else {
                return DEFAULT;
            }
        });
}

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Add mongoose connection?",
                default: false,
            },
        ])
        .then((answer) => {
            if (answer.enabled) {
                return needToConfigure(inquirer);
            } else {
                return false;
            }
        });
};

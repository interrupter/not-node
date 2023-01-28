import generator from "generate-password";

const DEFAULT_SECRET = generator.generate({
    length: 40,
    numbers: true,
});

const DEFAULT_SESSION_OPTIONS = {
    driver: "redis",
    secret: DEFAULT_SECRET,
    ttl: 2628000000,
    key: "SessionID",
};

function collectData(inquirer) {
    return inquirer.prompt([
        {
            type: "input",
            name: "key",
            message: "Session key",
            default: "SessionID",
        },
        {
            type: "list",
            name: "driver",
            message: "Session store driver",
            choices: ["mongoose", "redis"],
            default: "redis",
        },
        {
            type: "input",
            name: "secret",
            message: "Session secret",
            default: DEFAULT_SECRET,
        },
        {
            type: "input",
            name: "ttl",
            message: "Session Cookie Max Age",
            default: 2628000000,
        },
    ]);
}

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Change default configuration of sessions module?",
                default: false,
            },
        ])
        .then((answer) => {
            if (answer.enabled) {
                return collectData(inquirer);
            } else {
                return DEFAULT_SESSION_OPTIONS;
            }
        });
};

import generator from "generate-password";

const DEFAULT_PASSWORD = generator.generate({
    length: 10,
    numbers: true,
});

function collectInitRootUser(inquirer, config) {
    return inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Root username",
            default: "root",
        },
        {
            type: "input",
            name: "email",
            message: "Root user email",
            default: `admin@${config.hostname.development}`,
        },
        {
            type: "input",
            name: "password",
            message: "Root user password",
            default: DEFAULT_PASSWORD,
        },
        {
            type: "input",
            name: "passwordConfirmation",
            message: "Re-type root password",
            validate(inpt, answer) {
                return inpt === answer.password;
            },
        },
    ]);
}

export default (inquirer, config) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Init system superuser",
                default: true,
            },
        ])
        .then(({ enabled }) => {
            if (enabled) {
                return collectInitRootUser(inquirer, config);
            } else {
                return false;
            }
        });
};

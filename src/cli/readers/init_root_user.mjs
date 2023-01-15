import generator from "generate-password";

const DEFAULT_PASSWORD = generator.generate({
    length: 10,
    numbers: true,
});

function collectInitRootUser(inquirer) {
    return inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Name",
            default: "root",
        },
        {
            type: "input",
            name: "email",
            message: "Email",
        },
        {
            type: "input",
            name: "password",
            message: "Password",
            default: DEFAULT_PASSWORD,
        },
        {
            type: "input",
            name: "passwordConfirmation",
            message: "Re-type password",
            validate(inpt, answer) {
                return inpt === answer.password;
            },
        },
    ]);
}

export default (inquirer) => {
    inquirer
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
                return collectInitRootUser(inquirer);
            } else {
                return false;
            }
        });
};

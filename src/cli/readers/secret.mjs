import generator from "generate-password";

const DEFAULT_SECRET = generator.generate({
    length: 40,
    numbers: true,
});

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "Application General Secret Key",
                default: DEFAULT_SECRET,
            },
        ])
        .then((answers) => {
            return answers.name;
        });
};

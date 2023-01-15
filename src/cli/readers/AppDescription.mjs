export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "description",
                message: "Application Description",
                default: "notNodeApplication",
            },
        ])
        .then((answers) => {
            return answers.description;
        });
};

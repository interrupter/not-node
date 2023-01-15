export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "Application Name",
                default: "notNodeApplication",
            },
        ])
        .then((answers) => {
            return answers.name;
        });
};

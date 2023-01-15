export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "Model Name",
                default: "notNodeModel",
            },
        ])
        .then((answers) => {
            return answers.name;
        });
};

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "Module Name",
                default: "notNodeModule",
            },
        ])
        .then((answers) => {
            return answers.name;
        });
};

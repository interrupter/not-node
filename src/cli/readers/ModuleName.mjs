export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "Module Name",
                default: "not-my-module",
            },
        ])
        .then((answers) => {
            return answers.name;
        });
};

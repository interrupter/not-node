export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "value",
                message: "Port number",
                default: "3000",
            },
        ])
        .then((answers) => {
            return parseInt(answers.value);
        });
};

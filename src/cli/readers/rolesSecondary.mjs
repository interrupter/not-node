export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "additional",
                message: "Additional user roles",
                default: "confirmed,manager",
            },
        ])
        .then((answers) => {
            return answers.additional.split(",").map((entry) => entry.trim());
        });
};

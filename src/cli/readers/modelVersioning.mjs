export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Model should support versioning?",
                default: false,
            },
        ])
        .then((answer) => {
            return answer.enabled;
        });
};

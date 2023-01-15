export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Model should support validators?",
                default: true,
            },
        ])
        .then((answer) => {
            return answer.enabled;
        });
};

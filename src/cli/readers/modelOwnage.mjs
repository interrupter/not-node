export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message:
                    "Model should support ownage by a specific entity (default: User)?",
                default: false,
            },
        ])
        .then((answer) => {
            return answer.enabled;
        });
};

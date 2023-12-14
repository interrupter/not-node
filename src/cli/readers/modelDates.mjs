export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Model should have createdAt and updatedAt fields",
                default: false,
            },
        ])
        .then((answer) => {
            return answer.enabled;
        });
};

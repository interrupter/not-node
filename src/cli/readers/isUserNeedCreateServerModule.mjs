export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Add server module?",
                default: false,
            },
        ])
        .then(({ enabled }) => {
            return enabled;
        });
};

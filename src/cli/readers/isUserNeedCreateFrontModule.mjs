export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Add front module?",
                default: false,
            },
        ])
        .then(({ enabled }) => {
            return enabled;
        });
};

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Add front module bootstrap?",
                default: true,
            },
        ])
        .then(({ enabled }) => {
            return enabled;
        });
};

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Add entity (model, logic, route)?",
                default: false,
            },
        ])
        .then(({ enabled }) => {
            return enabled;
        });
};

export default (inquirer, config) => {
    return inquirer.prompt([
        {
            type: "input",
            name: "development",
            message: "Hostname (dev)",
            default: `${config.appName}.local`,
        },
        {
            type: "input",
            name: "stage",
            message: "Hostname (stage)",
            default: `stage.${config.appName}`,
        },
        {
            type: "input",
            name: "production",
            message: "Hostname (production)",
            default: `${config.appName}`,
        },
    ]);
};

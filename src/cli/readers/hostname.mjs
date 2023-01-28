const DEFAULT_HOST = "localhost";
export default (inquirer) => {
    return inquirer.prompt([
        {
            type: "input",
            name: "development",
            message: "Hostname (dev)",
            default: DEFAULT_HOST,
        },
        {
            type: "input",
            name: "stage",
            message: "Hostname (stage)",
            default: DEFAULT_HOST,
        },
        {
            type: "input",
            name: "production",
            message: "Hostname (production)",
            default: DEFAULT_HOST,
        },
    ]);
};

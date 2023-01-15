export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "value",
                message: "CORS (comma-separated: domain.com,list.foo.bar)",
                default: "",
            },
        ])
        .then(({ value }) => value.split(",").map((entry) => entry.trim()));
};

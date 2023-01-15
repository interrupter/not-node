export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "input",
                message: "Enter comma separated fields names",
                name: "fields",
            },
        ])
        .then((answer) =>
            answer.fields.split(",").map((entry) => entry.trim())
        );
};

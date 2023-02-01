import Options from "../lib/opts.mjs";

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "checkbox",
                message: "Select primary user roles set",
                name: "roles",
                choices: Options.roles.map((role) => {
                    return {
                        name: role,
                        checked: true,
                    };
                }),
                validate(answer) {
                    if (answer.length < 1) {
                        return "You must choose at least one role.";
                    }
                    return true;
                },
            },
        ])
        .then((answer) => answer.roles);
};

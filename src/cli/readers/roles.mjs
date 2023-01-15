import { DEFAULT_PRIMARY_ROLES_SET } from "../const.mjs";

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "checkbox",
                message: "Select primary user roles set",
                name: "roles",
                choices: DEFAULT_PRIMARY_ROLES_SET.map((role) => {
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

import { DEFAULT_MODULE_ACTIONS } from "../const.mjs";

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "checkbox",
                message: "Select entity actions",
                name: "actions",
                choices: DEFAULT_MODULE_ACTIONS.map((entry) => {
                    return {
                        name: entry,
                        checked: true,
                    };
                }),
            },
        ])
        .then((answer) => {
            let result = {};
            answer.actions.forEach((entry) => {
                result[entry] = { name: entry };
            });
            return result;
        });
};

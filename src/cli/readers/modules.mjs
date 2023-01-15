import { DEFAULT_MODULES_SET, DEFAULT_MODULES_SET_ENABLED } from "../const.mjs";

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "checkbox",
                message: "Select additional modules set",
                name: "modules",
                choices: DEFAULT_MODULES_SET.map((entry) => {
                    return {
                        name: entry,
                        checked: DEFAULT_MODULES_SET_ENABLED.includes(entry),
                    };
                }),
            },
        ])
        .then((answer) => answer.modules);
};

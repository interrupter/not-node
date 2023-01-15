import { DEFAULT_MODULE_LAYERS } from "../const.mjs";

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "checkbox",
                message: "Select module layers",
                name: "layers",
                choices: DEFAULT_MODULE_LAYERS.map((name) => {
                    return {
                        name,
                        checked: true,
                    };
                }),
                validate(answer) {
                    if (answer.length < 1) {
                        return "You must choose at least one layer.";
                    }
                    return true;
                },
            },
        ])
        .then((answer) => answer.layers);
};

import { DEFAULT_ENTITY_LAYERS } from "../const.mjs";

export default (inquirer, config, layersList = []) => {
    return inquirer
        .prompt([
            {
                type: "checkbox",
                message: "Select entity layers",
                name: "layers",
                choices: layersList
                    .filter((entry) => DEFAULT_ENTITY_LAYERS.includes(entry))
                    .map((name) => {
                        return {
                            name,
                            checked: true,
                        };
                    }),
            },
        ])
        .then((answer) => answer.layers);
};

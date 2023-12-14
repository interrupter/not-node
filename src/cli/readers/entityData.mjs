import { firstLetterToLower } from "../../common.js";
import actions from "./actions.mjs";
import fields from "./fields.mjs";
import entityLayers from "./entityLayers.mjs";
import modelValidators from "./modelValidators.mjs";
import modelVersioning from "./modelVersioning.mjs";
import modelIncrement from "./modelIncrement.mjs";

const DEFAULT = {
    ModelName: "NewModel",
    modelName: "newModel",
    actions: [],
    fields: [],
};

function collectData(inquirer) {
    return inquirer.prompt([
        {
            type: "input",
            name: "ModelName",
            message: "Entity name",
            default: DEFAULT.ModelName,
        },
    ]);
}

export default (inquirer, config, layersList) => {
    return collectData(inquirer).then(async (answer) => {
        const result = {
            ...answer,
            modelName: firstLetterToLower(answer.ModelName),
            actions: await actions(inquirer),
            fields: await fields(inquirer),
            layers: await entityLayers(inquirer, config, layersList),
        };
        if (result.layers.includes("models")) {
            result.validators = await modelValidators(inquirer);
            result.versioning = await modelVersioning(inquirer);
            result.increment = await modelIncrement(inquirer, result);
        } else {
            result.increment = false;
            result.versioning = false;
            result.validators = true;
        }
        console.log("Entity data", JSON.stringify(result));
        return result;
    });
};

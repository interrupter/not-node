import { firstLetterToLower } from "../../common.js";
import actions from "./actions.mjs";
import fields from "./fields.mjs";
import entityLayers from "./entityLayers.mjs";
import modelValidators from "./modelValidators.mjs";
import modelVersioning from "./modelVersioning.mjs";
import modelIncrement from "./modelIncrement.mjs";
import modelDates from "./modelDates.mjs";
import modelOwnage from "./modelOwnage.mjs";

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
        try {
            const result = {
                ...answer,
                modelName: firstLetterToLower(answer.ModelName),
                actions: await actions(inquirer),
                fields: await fields(inquirer, config),
                layers: await entityLayers(inquirer, config, layersList),
            };
            if (result.layers.includes("models")) {
                result.fieldsShortNames = result.fields.map((itm) => itm.indexOf('//') > 0?itm.split('//')[1]:itm);
                result.validators = await modelValidators(inquirer);
                result.versioning = await modelVersioning(inquirer);                
                result.ownage = await modelOwnage(inquirer);
                result.ownageFields = result.ownage?['not-node//owner','not-node//ownerModel']:[];                
                result.dates = await modelDates(inquirer);
                result.datesFields = result.dates?['not-node//createdAt','not-node//updatedAt']:[];
                const fieldsCompleteList = [...result.fields, ...result.ownageFields, ...result.datesFields];
                result.increment = await modelIncrement(inquirer, {fields:fieldsCompleteList});
            } else {
                result.fields = [];
                result.fieldsShortNames = [];
                result.increment = false;
                result.versioning = false;
                result.validators = true;
                result.ownage = false;
                result.ownageFields = [];
                result.dates = false;
                result.datesFields = [];
            }            
            return result;
        } catch (e) {
            console.error(e);
        }
    });
};

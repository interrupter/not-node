import { firstLetterToLower } from "../../../src/common.js";
import { resolve } from "node:path";
import inquirer from "inquirer";
import inquirerPrompt from "inquirer-autocomplete-prompt";

inquirer.registerPrompt("autocomplete", inquirerPrompt);
import * as Readers from "../readers/index.mjs";
import * as Renderers from "../renderers/index.mjs";
import { renderFile, createDir } from "./fs.mjs";

import Options from "./opts.mjs";

async function renderEntityFiles(module_src_dir, data, config) {
    for (let layerName of data.layers) {
        if (Object.hasOwn(Renderers, layerName)) {
            await Renderers[layerName](
                resolve(module_src_dir, `./${layerName}`),
                data,
                config,
                renderFile,
                Options.PATH_TMPL,
                createDir
            );
        } else {
            console.error("No renderer for layer: ", layerName);
        }
    }
    if (data.layers.includes("controllers") && Renderers.controllersCommons) {
        Renderers.controllersCommons(
            resolve(module_src_dir, `./controllers/common`),
            [data],
            config,
            renderFile,
            Options.PATH_TMPL
        );
    }
}

async function createEntity(modules_dir, config, availableFields) {
    const ModuleName = await Readers.ModuleName(inquirer);
    const moduleName = firstLetterToLower(ModuleName);
    const moduleDir = resolve(modules_dir, ModuleName);
    const moduleLayers = await Readers.moduleLayers(inquirer);
    const moduleConfig = {
        ...config,
        moduleName,
        ModuleName,
        moduleLayers,
        availableFields,
    };
    // console.log("moduleConfig", moduleConfig);
    const entityData = await Readers.entityData(
        inquirer,
        moduleConfig,
        moduleConfig.moduleLayers
    );
    //console.log("entityData", entityData);
    await renderEntityFiles(
        resolve(moduleDir, "./src"),
        entityData,
        moduleConfig
    );
}

export { createEntity, renderEntityFiles };

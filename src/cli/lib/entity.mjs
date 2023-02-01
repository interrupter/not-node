import { firstLetterToLower } from "../../../src/common.js";
import { resolve } from "node:path";
import inquirer from "inquirer";
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
}

async function createEntity(modules_dir, config) {
    const ModuleName = await Readers.ModuleName(inquirer);
    const moduleName = firstLetterToLower(ModuleName);
    const moduleDir = resolve(modules_dir, ModuleName);
    const moduleLayers = await Readers.moduleLayers(inquirer);
    const moduleConfig = { ...config, moduleName, ModuleName, moduleLayers };
    console.log();
    const entityData = await Readers.entityData(
        inquirer,
        moduleConfig,
        moduleConfig.moduleLayers
    );
    await renderEntityFiles(
        resolve(moduleDir, "./src"),
        entityData,
        moduleConfig
    );
}

export { createEntity, renderEntityFiles };

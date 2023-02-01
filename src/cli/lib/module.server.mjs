import { firstLetterToLower } from "../../../src/common.js";
import { resolve } from "node:path";
import inquirer from "inquirer";

import * as Readers from "../readers/index.mjs";
import * as Renderers from "../renderers/index.mjs";
import Options from "../lib/opts.mjs";
const PATH_TMPL = Options.PATH_TMPL;
import { renderFile, createDir, createDirContent } from "./fs.mjs";
import {
    ProjectSubStructures,
    ApplicationModuleServerControllersCommonStructure,
} from "./structures.mjs";

import { renderEntityFiles } from "./entity.mjs";

function entitiesInLayers(layersList = []) {
    return (
        layersList.includes("models") ||
        layersList.includes("routes") ||
        layersList.includes("logics")
    );
}

async function createLayersDirs(modules_dir, layersList, ModuleName) {
    if (layersList.length) {
        await createDir(resolve(modules_dir, ModuleName, "./src"));
    }
    for (let layer of layersList) {
        await createDir(resolve(modules_dir, ModuleName, "./src", layer));
    }
}

async function renderServerControllersCommons(
    module_src_dir,
    entitiesData,
    config
) {
    const dirPath = resolve(module_src_dir, `./common`);
    await createDir(dirPath);
    await createDirContent(
        dirPath,
        ApplicationModuleServerControllersCommonStructure,
        {}
    );
    await Renderers.controllersCommons(
        dirPath,
        entitiesData,
        config,
        renderFile,
        PATH_TMPL
    );
}

async function renderServerContollersIndexes(
    module_src_dir,
    entitiesData,
    config
) {
    const subDirList = [...config.roles];
    for (let dirName of subDirList) {
        await Renderers.controllersIndex(
            resolve(module_src_dir, `./controllers/${dirName}`),
            entitiesData,
            config,
            renderFile,
            PATH_TMPL,
            createDir
        );
    }
}

async function createServerModule(modules_dir, config) {
    //read module name
    const ModuleName = await Readers.ModuleName(inquirer);
    const moduleName = firstLetterToLower(ModuleName);
    const moduleDir = resolve(modules_dir, ModuleName);
    const moduleConfig = { ...config, moduleName, ModuleName };
    await createDir(moduleDir);
    //console.log(JSON.stringify(moduleConfig, null, 4));
    await createDirContent(
        moduleDir,
        ProjectSubStructures["module.server"],
        moduleConfig
    );
    const layersList = moduleConfig.moduleLayers;
    await createLayersDirs(modules_dir, layersList, ModuleName);
    //list of entities and its presence thru all selected layers
    let entitiesList = [];
    if (entitiesInLayers(layersList)) {
        //should collect all first, to have full list of items for index files imports
        while (await Readers.isUserNeedCreateEntity(inquirer)) {
            const entityData = await Readers.entityData(
                inquirer,
                config,
                layersList
            );
            entitiesList.push(entityData);
        }
        for (let entityData of entitiesList) {
            await renderEntityFiles(
                resolve(moduleDir, "./src"),
                entityData,
                moduleConfig
            );
        }
        if (layersList.includes("controllers")) {
            await renderServerContollersIndexes(
                resolve(moduleDir, "./src"),
                entitiesList,
                moduleConfig
            );
            await renderServerControllersCommons(
                resolve(moduleDir, "./src/controllers"),
                entitiesList,
                moduleConfig
            );
        }
    }
}

export {
    createLayersDirs,
    entitiesInLayers,
    renderServerControllersCommons,
    createServerModule,
    renderServerContollersIndexes,
};

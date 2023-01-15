#!/usr/bin/env node

const TEMPLATE_OPTIONS = "__options__";

const VAR_PREFIX = "__";
import ejs from "ejs";

import { isAbsolute, resolve, join } from "node:path";

import { copyFile, constants, mkdir, writeFile } from "node:fs/promises";

import { cwd } from "node:process";
const CWD = cwd();

import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

import inquirer from "inquirer";
import { Command, Option } from "commander";
const program = new Command();

//reads vars from user input, provides defaults
import * as Readers from "../src/cli/readers/index.mjs";

import * as Renderers from "../src/cli/renderers/index.mjs";
//file system structure
//directories
//files and information how to render them from which template and with what args with readers names
import ApplicationStructure from "../tmpl/dir_structures/app.mjs";
import ApplicationServerStructure from "../tmpl/dir_structures/server.mjs";
import ApplicationFrontStructure from "../tmpl/dir_structures/front.mjs";
import ApplicationStaticStructure from "../tmpl/dir_structures/static.mjs";

import ApplicationModuleServerStructure from "../tmpl/dir_structures/module.server.mjs";

import { firstLetterToLower } from "../src/common.js";

const ApplicationSubStructures = {
    server: ApplicationServerStructure,
    front: ApplicationFrontStructure,
    static: ApplicationStaticStructure,
    "module.server": ApplicationModuleServerStructure,
};
//path to various templates
const PATH_TMPL = resolve(__dirname, "../tmpl/files");
const DEFAULT_SERVER_MODULES_SUB_PATH = "./app/server/modules";
const DEFAULT_FRONT_MODULES_SUB_PATH = "./app/front/src";

async function readArgs(structure, config) {
    let result = {};
    if (Object.hasOwn(structure, "args")) {
        for (let entry of structure.args) {
            if (!Object.hasOwn(config, entry)) {
                console.log(
                    `no ${entry} in config, reading data from user input`
                );
                config[entry] = await Readers[entry](inquirer, config);
            }
            result[entry] = config[entry];
        }
    }
    //console.log(JSON.stringify(result, null, 4));
    if (Object.hasOwn(structure, "options")) {
        result[TEMPLATE_OPTIONS] = structure.options;
    }
    return result;
}

async function renderFile(input, dest, data) {
    console.log("render", dest);
    const renderedFileContent = await ejs.renderFile(input, data, {
        async: true,
    });
    await writeFile(dest, renderedFileContent);
}

async function createFileContent(filePath, structure, config) {
    if (typeof structure == "string") {
        await copyTmplFile(resolve(PATH_TMPL, structure), filePath);
        return;
    }
    if (Object.hasOwn(structure, "tmpl")) {
        const tmplFilePath = resolve(PATH_TMPL, structure.tmpl);
        const data = await readArgs(structure, config);
        await renderFile(tmplFilePath, filePath, data);
    }
}

async function copyTmplFile(from, to) {
    try {
        //  console.log("cp", from, to);
        await copyFile(from, to, constants.COPYFILE_EXCL);
    } catch {
        //console.error("The file could not be copied", from, to);
    }
}

async function createDir(dirPath) {
    try {
        //console.log("mkdir", dirPath);
        await mkdir(dirPath, { recursive: true });
    } catch {
        // console.error("Can't create directory", dirPath);
    }
}

function isFilename(name, descr) {
    if (descr.type === "file") {
        return true;
    }
    if (name.startsWith(VAR_PREFIX) && name.endsWith(VAR_PREFIX)) {
        return false;
    }
    return name.indexOf(".") > -1;
}

function isVariable(name) {
    return name.startsWith(VAR_PREFIX) && name.endsWith(VAR_PREFIX);
}

function getVariableName(name) {
    return name.replace(new RegExp(VAR_PREFIX, "g"), "");
}

function dirRequiresAbsentModules(subStructure, config) {
    return (
        Object.hasOwn(subStructure, "ifModules") &&
        Array.isArray(subStructure.ifModules) &&
        !subStructure.ifModules.every((entry) => config.modules.includes(entry))
    );
}

async function createDirContent(dest, structure = {}, config = {}) {
    if (typeof structure === "string") {
        //console.log("need to create sub structure", structure);
        await createDirContent(
            dest,
            ApplicationSubStructures[structure],
            config
        );
        return;
    }
    const dirs = {};
    //creating files first
    for (let entry in structure) {
        const subStructure = structure[entry];
        if (isVariable(entry)) {
            entry = config[getVariableName(entry)];
        }
        if (isFilename(entry, subStructure)) {
            //  console.log(dest, entry);
            const filePath = join(dest, entry);
            await createFileContent(filePath, subStructure, config);
        } else {
            dirs[entry] = subStructure;
        }
    }
    //then going deeper
    for (let entry in dirs) {
        const subStructure = dirs[entry];
        const directoryPath = join(dest, entry);
        if (dirRequiresAbsentModules(subStructure, config)) {
            continue;
        }
        await createDir(directoryPath);
        if (Object.hasOwn(subStructure, "content")) {
            await createDirContent(directoryPath, subStructure.content, config);
        }
    }
}

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

async function createServerModule(modules_dir, config) {
    //read module name
    const ModuleName = await Readers.ModuleName(inquirer);
    const moduleName = firstLetterToLower(ModuleName);
    const moduleDir = resolve(modules_dir, ModuleName);
    const moduleConfig = { ...config, moduleName, ModuleName };
    await createDir(moduleDir);
    console.log(JSON.stringify(moduleConfig, null, 4));
    await createDirContent(
        moduleDir,
        ApplicationSubStructures["module.server"],
        moduleConfig
    );
    const layersList = moduleConfig.moduleLayers;
    await createLayersDirs(modules_dir, layersList, ModuleName);
    //list of entities and its presence thru all selected layers

    if (entitiesInLayers(layersList)) {
        while (await Readers.isUserNeedCreateEntity(inquirer)) {
            const entityData = await Readers.entityData(
                inquirer,
                config,
                layersList
            );
            await renderEntityFiles(
                resolve(moduleDir, "./src"),
                entityData,
                moduleConfig
            );
        }
    }
}

async function renderEntityFiles(module_src_dir, data, config) {
    for (let layerName of data.layers) {
        await Renderers[layerName](
            resolve(module_src_dir, `./${layerName}`),
            data,
            config,
            renderFile,
            PATH_TMPL
        );
    }
}

async function createFrontModule(modules_dir, config) {
    return;
}

program
    .command("create")
    .addOption(
        new Option("-d, --dir <dir>").default(CWD, "current working directory")
    )
    .description("create application in target directory")
    .action(async (opts) => {
        //        console.log(opts);
        //      console.log("create command called :" + opts.dir);
        if (!isAbsolute(opts.dir)) {
            opts.dir = resolve(CWD, opts.dir);
        }
        const AppConfig = {};
        //
        AppConfig.AppName = await Readers.AppName(inquirer, AppConfig);
        AppConfig.appName = await Readers.appName(inquirer, AppConfig);
        AppConfig.roles = await Readers.roles(inquirer, AppConfig);
        AppConfig.rolesSecondary = await Readers.rolesSecondary(
            inquirer,
            AppConfig
        );
        AppConfig.modules = await Readers.modules(inquirer, AppConfig);
        await createDir(opts.dir);
        await createDirContent(opts.dir, ApplicationStructure, AppConfig);
        const PATH_MODULES_SERVER = resolve(
            opts.dir,
            DEFAULT_SERVER_MODULES_SUB_PATH
        );
        const PATH_MODULES_FRONT = resolve(
            opts.dir,
            DEFAULT_FRONT_MODULES_SUB_PATH
        );
        while (await Readers.isUserNeedCreateServerModule(inquirer)) {
            await createServerModule(PATH_MODULES_SERVER, AppConfig);
        }
        while (await Readers.isUserNeedCreateFrontModule(inquirer)) {
            await createFrontModule(PATH_MODULES_FRONT, AppConfig);
        }
    });

program.parse();

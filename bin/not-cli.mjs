#!/usr/bin/env node
const TEMPLATE_OPTIONS = "__options__";

const VAR_PREFIX = "__";
import ejs from "ejs";

import { isAbsolute, resolve, join } from "node:path";

import { copyFile, constants, mkdir, writeFile } from "node:fs/promises";

import { cwd } from "node:process";
const CWD = cwd();
import { spawn } from "node:child_process";

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
import ProjectStructure from "../tmpl/dirs/project.mjs";
import ApplicationStructure from "../tmpl/dirs/app.mjs";
import ApplicationServerStructure from "../tmpl/dirs/server.mjs";
import ApplicationFrontStructure from "../tmpl/dirs/front.mjs";
import ApplicationStaticStructure from "../tmpl/dirs/static.mjs";

import ApplicationModuleServerStructure from "../tmpl/dirs/module.server.mjs";
import ApplicationModuleServerControllersCommonStructure from "../tmpl/dirs/module.server.controllers.common.mjs";

import ApplicationModuleFrontStructure from "../tmpl/dirs/module.front.mjs";

import { firstLetterToLower } from "../src/common.js";

const ProjectSubStructures = {
    app: ApplicationStructure,
    server: ApplicationServerStructure,
    front: ApplicationFrontStructure,
    static: ApplicationStaticStructure,
    "module.server": ApplicationModuleServerStructure,
    "module.server.controllers.common":
        ApplicationModuleServerControllersCommonStructure,
    "module.front": ApplicationModuleFrontStructure,
};
//path to various templates
const PATH_TMPL = resolve(__dirname, "../tmpl/files");
const DEFAULT_SERVER_MODULES_SUB_PATH = "./site/app/server/modules";
const DEFAULT_FRONT_MODULES_SUB_PATH = "./site/app/front/src";

let silent = true;

async function readArgs(structure, config) {
    let result = {};
    if (Object.hasOwn(structure, "args")) {
        for (let entry of structure.args) {
            if (!Object.hasOwn(config, entry)) {
                !silent &&
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
    !silent && console.log("render", dest);
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

function dirRequiresNotNullArgs(subStructure, config) {
    return (
        Object.hasOwn(subStructure, "ifArgs") &&
        Array.isArray(subStructure.ifArgs) &&
        !subStructure.ifArgs.every((entry) => {
            return Object.hasOwn(config, entry) && config[entry];
        })
    );
}
async function createDirContent(dest, structure = {}, config = {}) {
    if (typeof structure === "string") {
        //console.log("need to create sub structure", structure);
        await createDirContent(dest, ProjectSubStructures[structure], config);
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
        if (dirRequiresNotNullArgs(subStructure, config)) {
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

async function renderEntityFiles(module_src_dir, data, config) {
    for (let layerName of data.layers) {
        if (Object.hasOwn(Renderers, layerName)) {
            await Renderers[layerName](
                resolve(module_src_dir, `./${layerName}`),
                data,
                config,
                renderFile,
                PATH_TMPL,
                createDir
            );
        } else {
            console.error("No renderer for layer: ", layerName);
        }
    }
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

async function createBootstrapFrontModule(modules_dir, config) {
    await createDir(modules_dir);
    await createDirContent(
        modules_dir,
        ProjectSubStructures["module.front"],
        config
    );
    for (let role of config.roles) {
        await createDir(resolve(modules_dir, role));
        const targetFrontModuleDir = resolve(modules_dir, role, "main");
        await createDir(targetFrontModuleDir);
        if (role === "guest") {
            await Renderers.frontModuleGuestMain(
                targetFrontModuleDir,
                { ...config, roleName: role },
                renderFile,
                PATH_TMPL
            );
        } else {
            await Renderers.frontModuleRoleMain(
                targetFrontModuleDir,
                { ...config, roleName: role },
                renderFile,
                PATH_TMPL
            );
        }
    }
}

function installPackages(siteDir) {
    return new Promise((resolve, reject) => {
        console.log("installing packages...");
        let npmInstall = spawn(`npm`, ["i"], {
            cwd: siteDir,
        });

        npmInstall.stderr.on("data", (data) => {
            !silent && console.error(data.toString());
        });
        npmInstall.on("exit", (code) => {
            if (code == 0) {
                resolve();
            } else {
                reject(`NPM install exited with code ${code}`);
            }
        });
    });
}

function buildClientSideScripts(siteDir) {
    return new Promise((resolve, reject) => {
        console.log("building client side scripts...");
        let npmInstall = spawn(`npm`, ["run", "build"], {
            cwd: siteDir,
        });

        npmInstall.stderr.on("data", (data) => {
            !silent && console.error(data.toString());
        });
        npmInstall.on("exit", (code) => {
            if (code == 0) {
                resolve();
            } else {
                reject(`npm run build job exited with code ${code}`);
            }
        });
    });
}

function postStartupInstructions(siteDir, config) {
    console.log(
        "Generation of source code, configurations, toolchain and installation of packages successfully finished."
    );
    if (config.nginx) {
        console.log("To enable NGINX reverse proxy:");
        console.log(
            "1. Copy config file for desired envrionment to NGINX directory and enable it"
        );
        for (let env of ["development", "stage", "production"]) {
            console.log(
                `For '${env}' environment exec while in project directory:`
            );
            console.log(
                `$ sudo cp nginx/${env}.conf to /var/nginx/sites-available/${config.hostname[env]}.conf`
            );
            console.log(
                `$ sudo ln -s /var/nginx/sites-available/${config.hostname[env]}.conf /var/nginx/sites-enabled/${config.hostname[env]}.conf`
            );
        }
        console.log("2. Restart NGINX server");
        console.log("$ sudo systemctl restart nginx");
    }
    console.log(
        `To start server navigate to [project]/site directory (cd '${siteDir}') and run 'npm start'`
    );
}

function makeScriptExecutable(pathToTargetScript) {
    return new Promise((resolve, reject) => {
        console.log(`chmod`, "+x", pathToTargetScript);
        let npmInstall = spawn(`chmod`, ["+x", pathToTargetScript]);
        npmInstall.stderr.on("data", (data) => {
            !silent && console.error(data.toString());
        });
        npmInstall.on("exit", (code) => {
            if (code == 0) {
                resolve();
            } else {
                reject(`chmod +x ${pathToTargetScript}  ${code}`);
            }
        });
    });
}

async function createProjectToolsAndConfigs(projectDir, projectConfig) {
    console.log(projectDir);
    if (projectConfig.pm2) {
        console.log("Rendering PM2 configs");
        await Renderers.pm2(projectDir, {}, projectConfig, createFileContent);
    }

    if (projectConfig.nginx) {
        console.log("Rendering NGINX configs");
        await Renderers.nginx(projectDir, {}, projectConfig, createFileContent);
    }

    if (projectConfig.deploy) {
        console.log("Rendering deployment scripts");
        await Renderers.deploy(
            projectDir,
            {},
            projectConfig,
            createFileContent,
            makeScriptExecutable
        );
    }
}

program
    .command("create")
    .addOption(
        new Option("-d, --dir <dir>").default(CWD, "current working directory")
    )
    .addOption(new Option("-v, --verbose").default(false, "extensive output"))
    .description(
        "create application in target directory (create -d [pathToDir])"
    )
    .action(async (opts) => {
        //      console.log("create command called :" + opts.dir);
        if (!isAbsolute(opts.dir)) {
            opts.dir = resolve(CWD, opts.dir);
        }
        const siteDir = resolve(opts.dir, "./site");
        if (opts.v) {
            silent = false;
        }
        console.log("creating project in", opts.dir);
        console.log("creating site in", siteDir);
        const ProjectConfig = {
            path: opts.dir,
        };
        //
        ProjectConfig.AppName = await Readers.AppName(inquirer, ProjectConfig);
        ProjectConfig.appName = await Readers.appName(inquirer, ProjectConfig);
        ProjectConfig.hostname = await Readers.hostname(
            inquirer,
            ProjectConfig
        );
        ProjectConfig.roles = await Readers.roles(inquirer, ProjectConfig);
        ProjectConfig.rolesSecondary = await Readers.rolesSecondary(
            inquirer,
            ProjectConfig
        );
        ProjectConfig.modules = await Readers.modules(inquirer, ProjectConfig);
        ProjectConfig.nginx = await Readers.nginx(inquirer, ProjectConfig);
        ProjectConfig.pm2 = await Readers.pm2(inquirer, ProjectConfig);
        ProjectConfig.deploy = await Readers.deploy(inquirer, ProjectConfig);
        ProjectConfig.port = await Readers.port(inquirer, ProjectConfig);
        ProjectConfig.debugPort = await Readers.debugPort(
            inquirer,
            ProjectConfig
        );
        ProjectConfig.not_node_monitor = await Readers.not_node_monitor(
            inquirer,
            ProjectConfig
        );
        ProjectConfig.not_node_reporter = await Readers.not_node_reporter(
            inquirer,
            ProjectConfig
        );
        await createDir(opts.dir);
        await createDirContent(opts.dir, ProjectStructure, ProjectConfig);
        await createProjectToolsAndConfigs(opts.dir, ProjectConfig);
        const PATH_MODULES_SERVER = resolve(
            opts.dir,
            DEFAULT_SERVER_MODULES_SUB_PATH
        );
        const PATH_MODULES_FRONT = resolve(
            opts.dir,
            DEFAULT_FRONT_MODULES_SUB_PATH
        );
        while (await Readers.isUserNeedCreateServerModule(inquirer)) {
            await createServerModule(PATH_MODULES_SERVER, ProjectConfig);
        }

        if (await Readers.isUserNeedFrontModuleBootstrap(inquirer)) {
            await createBootstrapFrontModule(PATH_MODULES_FRONT, ProjectConfig);
        }

        console.log("siteDir", siteDir);
        await installPackages(siteDir);
        await buildClientSideScripts(siteDir);
        postStartupInstructions(siteDir, ProjectConfig);
    });

program.parse();

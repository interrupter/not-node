import Logger from "./log.mjs";
import {
    readArgs,
    isFilename,
    isVariable,
    dirRequiresAbsentModules,
    dirRequiresNotNullArgs,
    getVariableName,
} from "./args.mjs";

import { ProjectSubStructures } from "./structures.mjs";

import { spawn } from "node:child_process";
import { resolve, join, parse } from "node:path";
import {
    copyFile,
    constants,
    mkdir,
    writeFile,
    readFile,
    readdir,
    lstat,
} from "node:fs/promises";

import ejs from "ejs";

import Options from "./opts.mjs";
const PATH_TMPL = Options.PATH_TMPL;

async function renderFile(input, dest, data) {
    try {
        Logger.log("render", dest);
        const renderedFileContent = await ejs.renderFile(input, data, {
            async: true,
        });
        await writeFile(dest, renderedFileContent);
    } catch (e) {
        console.error(e);
    }
}

async function createFileContent(filePath, structure, config) {
    try {
        if (typeof structure == "string") {
            await copyTmplFile(resolve(PATH_TMPL, structure), filePath);
            return;
        }
        if (Object.hasOwn(structure, "tmpl")) {
            const tmplFilePath = resolve(PATH_TMPL, structure.tmpl);
            const data = await readArgs(structure, config);
            await renderFile(tmplFilePath, filePath, data);
        }
    } catch (e) {
        console.error(e);
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

function getProjectSiteDir(dir, CWD) {
    if (dir === "") {
        return resolve(CWD, "./site");
    } else {
        if (
            (dir.indexOf("/") > -1 || dir.indexOf("\\") > -1) &&
            dir !== "./" &&
            dir !== ".\\"
        ) {
            return dir;
        } else {
            return resolve(CWD, dir);
        }
    }
}

async function createDir(dirPath) {
    try {
        console.log("mkdir", dirPath);
        await mkdir(dirPath, { recursive: true });
    } catch {
        console.error("Can't create directory", dirPath);
    }
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

function makeScriptExecutable(pathToTargetScript) {
    return new Promise((resolve, reject) => {
        console.log(`chmod`, "+x", pathToTargetScript);
        let npmInstall = spawn(`chmod`, ["+x", pathToTargetScript]);
        npmInstall.stderr.on("data", (data) => {
            Logger.error(data.toString());
        });
        npmInstall.on("exit", (code) => {
            if (code == 0) {
                resolve(true);
            } else {
                reject(`chmod +x ${pathToTargetScript}  ${code}`);
            }
        });
    });
}

function installPackages(siteDir) {
    return new Promise((resolve, reject) => {
        console.log("installing packages...");
        let npmInstall = spawn(`npm`, ["i"], {
            cwd: siteDir,
        });

        npmInstall.stderr.on("data", (data) => {
            Logger.error(data.toString());
        });
        npmInstall.on("exit", (code) => {
            if (code == 0) {
                resolve(true);
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

        npmInstall.stdout.on("data", (data) => {
            Logger.log(data.toString());
        });

        npmInstall.stderr.on("data", (data) => {
            Logger.error(data.toString());
        });
        npmInstall.on("exit", (code) => {
            if (code == 0) {
                resolve(true);
            } else {
                reject(`npm run build job exited with code ${code}`);
            }
        });
    });
}

async function readJSONFile(fname) {
    const rawdata = await readFile(fname);
    return JSON.parse(rawdata.toString());
}

async function tryDirAsync(dirPath) {
    try {
        const stat = await lstat(dirPath);
        return stat && stat.isDirectory();
    } catch {
        return false;
    }
}

function isJSFilename(fname) {
    return new RegExp(".+.(js|cjs|mjs)+$").test(fname);
}

function removeExtension(fname) {
    return parse(fname).name;
}

async function findFieldsInDir(pathToDir) {
    const fields = await readdir(pathToDir);
    return fields.filter(isJSFilename).map(removeExtension);
}

async function findFieldsInModule(pathToModule) {
    const variants = [
        join(pathToModule, "src/core/fields"),
        join(pathToModule, "src/fields"),
        join(pathToModule, "fields"),
    ];
    try {
        for (const nameVariants of variants) {
            if (await tryDirAsync(nameVariants)) {
                return await findFieldsInDir(nameVariants);
            }
        }
        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

/**
 *
 * @param {*} modulesDirPath
 * @returns {Promise<Array>}
 */
async function findAllFieldsInModules(modulesDirPath) {
    try {
        const modulesNames = await readdir(modulesDirPath);
        const result = [];
        for (const moduleName of modulesNames) {
            if (moduleName && moduleName.indexOf("not-") === 0) {
                const listOfFieldsInModule = await findFieldsInModule(
                    join(modulesDirPath, moduleName)
                );
                if (listOfFieldsInModule && listOfFieldsInModule.length) {
                    const listOfFieldsDescriptions = listOfFieldsInModule.map(
                        (fieldName) => {
                            return {
                                fieldName,
                                moduleName,
                                fullName: `${moduleName}//${fieldName}`,
                            };
                        }
                    );
                    result.push(...listOfFieldsDescriptions);
                }
            }
        }
        return result;
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function findAllFieldsInGlobalNodeModules() {
    const result = [];
    for (let globalLib of Options.DEFAULT_GLOBAL_NPM_LIB) {
        const dirname = join(globalLib, "node_modules");
        try {
            result.push(...(await findAllFieldsInModules(dirname)));
        } catch {
            Logger.log("No fields in ", dirname);
        }
    }
    return result;
}

async function findAllFieldsInLocalNodeModules(siteDirPath) {
    const dirname = join(siteDirPath, "node_modules");
    return await findAllFieldsInModules(dirname);
}

async function findAllFields(siteDirPath, modulesDir) {
    try {
        const fieldsInGlobalNodeModules =
            await findAllFieldsInGlobalNodeModules();
        const fieldsInLocalNodeModules = await findAllFieldsInLocalNodeModules(
            siteDirPath
        );
        const fieldsInProjectModules = await findAllFieldsInModules(modulesDir);
        const fromNPM = fieldsInLocalNodeModules.length
            ? fieldsInLocalNodeModules
            : fieldsInGlobalNodeModules;
        return [...fromNPM, ...fieldsInProjectModules];
    } catch (err) {
        console.error(err);
        return [];
    }
}

export {
    createDir,
    copyTmplFile,
    createFileContent,
    renderFile,
    createDirContent,
    makeScriptExecutable,
    buildClientSideScripts,
    installPackages,
    readJSONFile,
    getProjectSiteDir,
    findAllFields,
    findFieldsInModule,
};

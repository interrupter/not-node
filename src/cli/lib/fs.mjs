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
import { resolve, join } from "node:path";
import {
    copyFile,
    constants,
    mkdir,
    writeFile,
    readFile,
} from "node:fs/promises";

import ejs from "ejs";

import Options from "./opts.mjs";
const PATH_TMPL = Options.PATH_TMPL;

async function renderFile(input, dest, data) {
    Logger.log("render", dest);
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
        //console.log("mkdir", dirPath);
        await mkdir(dirPath, { recursive: true });
    } catch {
        // console.error("Can't create directory", dirPath);
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
                resolve();
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
            Logger.error(data.toString());
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

async function readJSONFile(fname) {
    const rawdata = await readFile(fname);
    return JSON.parse(rawdata);
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
};

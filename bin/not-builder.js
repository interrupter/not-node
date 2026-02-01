#!/usr/bin/env node

/*

	not-node project builder

	build project to current folder by specified environment rules,
	if `to` path not empty then will be generated project artifact

*/

var argv = require("yargs").argv,
    fs = require("fs"),
    path = require("path"),
    child_process = require("child_process"),
    deepMerge = require("deepmerge"),
    lib = require("../src/lib.js");

const TEMPLATES_EXT = ".html";
const SCRIPTS_EXT = ".js";
const STYLES_EXT = ".scss";
const COMMON_TEMPLATES = "common";

console.log("NODE VERSION", process.version);

let opts = {
        environment: argv.environment || "production",
        to: argv.to || false,
        config: argv.config || "./project.manifest.json",
        rollup:
            argv.rollup ||
            path.join(process.cwd(), "./node_modules/.bin/rollup"),
        role: argv.role || null,
        verbose: argv.verbose || false,
    },
    configName = path.join(process.cwd(), opts.config),
    config = {};

/**
 *	Returns list of directories in directory
 *	@param {string} dir directory to search
 *	@return {Promise} of array of directories
 */
function listDir(dir) {
    return new Promise((resolve, reject) => {
        fs.stat(dir, (err_stat, info) => {
            if (err_stat) {
                reject(err_stat);
            } else {
                if (info) {
                    fs.readdir(dir, (err_readdir, files) => {
                        if (err_readdir) {
                            reject("Error while reading directory file list.");
                        } else {
                            files = files.filter((item) => {
                                return fs
                                    .lstatSync(path.join(dir, item))
                                    .isDirectory();
                            });
                            resolve(files);
                        }
                    });
                } else {
                    reject("Not exists!");
                }
            }
        });
    });
}

/**
 *	Returns list of files in directory
 *	@param {string} dir directory to search
 *	@return {Promise} of array of files
 */
function listFiles(dir, ext) {
    //console.info('list files in ',dir,' for ', ext);
    return new Promise((resolve, reject) => {
        fs.stat(dir, (err_stat, info) => {
            if (err_stat) {
                reject(err_stat);
            } else {
                if (info) {
                    fs.readdir(dir, (err_readdir, files) => {
                        if (err_readdir) {
                            reject("Error while reading directory file list.");
                        } else {
                            //console.log(files);
                            files = files.filter((item) => {
                                if (
                                    !fs.lstatSync(path.join(dir, item)).isFile()
                                ) {
                                    //console.log(item, 'is not a file');
                                    return false;
                                }
                                if (item.indexOf(ext) === -1) {
                                    //console.log(item, 'wrong ext 1');
                                    return false;
                                }
                                let diff = item.length - ext.length;
                                return diff === item.indexOf(ext);
                            });
                            resolve(files);
                        }
                    });
                } else {
                    reject("Not exists!");
                }
            }
        });
    });
}

async function fileExists(filename) {
    try {
        await fs.promises.access(filename, fs.constants.R_OK);
        return true;
    } catch (_) {
        //console.error('not exists', filename);
        return false;
    }
}

async function indexFilesExistsInDir(dir, exts = ["js"]) {
    let filenamesList = exts.map((ext) => path.join(dir, `index.${ext}`));
    let checks = filenamesList.map((filename) => fileExists(filename));
    let results = await Promise.all(checks);
    //console.log(results.some(res => res));
    return results.some((res) => res);
}

/**
 *	Returns list of full path to files in directory
 *	@param {string} dir path to directory
 *	@return {array} list of full files paths
 */
async function listFilesPaths(dir, ext) {
    let listOfFiles,
        result = [];
    try {
        listOfFiles = await listFiles(dir, ext);
    } catch (e) {
        console.error(e);
    }
    listOfFiles.forEach((filename) => {
        result.push(path.join(dir, filename));
    });
    return result;
}

/**
 *	Loads template files for specific role
 *	@param 	{string} 	dir 	path to templates directory
 *	@param 	{string}	role	user role
 *	@return {array}		list of template files
 */
async function loadTemplates(
    dir,
    role = COMMON_TEMPLATES,
    templatesExt = TEMPLATES_EXT
) {
    let dirsList = await listDir(dir),
        filesList = await listFiles(dir, templatesExt),
        result = [];
    if (dirsList && Array.isArray(dirsList) && dirsList.length > 0) {
        if (dirsList.indexOf(role) > -1) {
            let pathToModRole = path.join(dir, role),
                files = await listFilesPaths(pathToModRole, templatesExt);
            if (Array.isArray(files)) {
                result.push(...files);
            }
        }
    }
    if (filesList && Array.isArray(filesList) && filesList.length > 0) {
        if (filesList.indexOf(role + templatesExt) > -1) {
            result.push(path.join(dir, role + templatesExt));
        }
    }
    //console.log('templates in ',dir,role,result);
    return result;
}

/**
 *	Loads template files for specific role from front-end app
 *	@param 	{string} 	dir 	path to templates directory
 *	@param 	{string}	role	user role
 *	@return {array}		list of template files
 */
async function loadTemplatesForFront(
    dir,
    role,
    commonDir = COMMON_TEMPLATES,
    templatesExt = TEMPLATES_EXT
) {
    let listDirs,
        roleDir = path.join(dir, role),
        result = [];
    commonDir = path.join(dir, commonDir);
    try {
        listDirs = await listDir(dir);
    } catch (e) {
        console.error(e);
    }
    //console.log('listDirs:', listDirs);
    try {
        if (fs.lstatSync(commonDir).isDirectory()) {
            //console.log('Directory ', commonDir, ' exists!');
            let files = await listFilesPaths(commonDir, templatesExt);
            //console.log('common files:', files);
            result.push(...files);
        } else {
            //console.log('no such directory', commonDir);
        }
    } catch (e) {
        console.error(e);
    }
    if (fs.lstatSync(roleDir).isDirectory()) {
        let modsDir;
        try {
            modsDir = await listDir(roleDir);
        } catch (e) {
            console.error(e);
        }
        //console.log('!front ',role,roleDir,modsDir);
        if (Array.isArray(modsDir)) {
            for (let t = 0; t < modsDir.length; t++) {
                let modDir = modsDir[t];
                let files = await listFilesPaths(
                    path.join(roleDir, modDir),
                    templatesExt
                );
                //console.log('list of files', files);
                result.push(...files);
            }
        }
    } else {
        console.error("Directory is not exists: ", roleDir);
    }
    return result;
}

/**
 *	Loads information in not-* style module installed through NPM,
 *	that mentioned in [targetManifest].modules.npm
 *	@param {string} modName 	mondule name
 *	@param {object} modOptions	module options from [targetManifest].modules.npm[moduleName]
 *	@param {array}	roles		used user roles
 *	@returns {object}			result[role][controller]
 */
async function loadNPMModule() {
    let result = {};
    try {
        let { modName, modOptions, roles } = arguments[0];
        let mod = require(modName);
        for (let i = 0; i < roles.length; i++) {
            result[roles[i]] = {
                controllers: [],
                templates: [],
                styles: [],
            };
        }

        if (mod.paths) {
            if (mod.paths.controllers) {
                let pathToControllers = mod.paths.controllers;
                let dirList = await listDir(pathToControllers);
                if (dirList && Array.isArray(dirList) && dirList.length > 0) {
                    let common = dirList.indexOf(COMMON_TEMPLATES) > -1;
                    roles.forEach((role) => {
                        if (dirList.indexOf(role) > -1) {
                            result[role].controllers.push(
                                path.join(pathToControllers, role)
                            );
                        }
                        if (common) {
                            result[role].controllers.push(
                                path.join(pathToControllers, "common")
                            );
                        }
                    });
                }
            }
            if (mod.paths.templates) {
                let commons;
                try {
                    commons = await loadTemplates(mod.paths.templates);
                } catch (e) {
                    console.error(e);
                    commons = [];
                }
                for (let role of roles) {
                    let list = await loadTemplates(mod.paths.templates, role);
                    list.push(...commons);
                    result[role].templates.push(...list);
                }
                opts.verbose && console.log("result", result);
            } else {
                opts.verbose && console.info("...no templates");
            }
            if (mod.paths.styles) {
                let commons;
                try {
                    commons = await loadTemplates(
                        mod.paths.styles,
                        COMMON_TEMPLATES,
                        STYLES_EXT
                    );
                } catch (e) {
                    console.error(e);
                    commons = [];
                }
                for (let role of roles) {
                    let list = await loadTemplates(
                        mod.paths.styles,
                        role,
                        STYLES_EXT
                    );
                    list.push(...commons);
                    result[role].styles.push(...list);
                }
                opts.verbose && console.log("result", result);
            } else {
                opts.verbose && console.info("...no styles");
            }
        }
    } catch (e) {
        console.error(e);
    }
    opts.verbose && console.log("npm module content ", result);
    return result;
}

async function loadServerModule() {
    let result = {};
    try {
        let { modName, modOptions, roles, pathToModule } = arguments[0];
        let mod = require(pathToModule);
        for (let i = 0; i < roles.length; i++) {
            result[roles[i]] = {
                controllers: [],
                templates: [],
                styles: [],
            };
        }
        if (mod.paths) {
            if (mod.paths.controllers) {
                let pathToControllers = mod.paths.controllers;
                //console.log(pathToControllers);
                let dirList = await listDir(pathToControllers);
                //console.log(dirList);
                if (dirList && Array.isArray(dirList) && dirList.length > 0) {
                    for (let i = 0; i < roles.length; i++) {
                        let role = roles[i];
                        if (dirList.indexOf("common") > -1) {
                            let pathToModRole = path.join(
                                pathToControllers,
                                "common"
                            );
                            if (await indexFilesExistsInDir(pathToModRole)) {
                                result[role].controllers.push(pathToModRole);
                            }
                        }
                        if (dirList.indexOf(role) > -1) {
                            let pathToModRole = path.join(
                                pathToControllers,
                                role
                            );
                            result[role].controllers.push(pathToModRole);
                        }
                    }
                }
            } else {
                opts.verbose && console.info("...no controllers");
            }
            if (mod.paths.templates) {
                let commons;
                try {
                    commons = await loadTemplates(mod.paths.templates);
                } catch (e) {
                    console.error(e);
                    commons = [];
                }
                //console.log('commons', commons);
                for (let i = 0; i < roles.length; i++) {
                    try {
                        //console.log('loadTemplates', typeof loadTemplates);
                        let role = roles[i],
                            list = await loadTemplates(
                                mod.paths.templates,
                                role
                            );
                        //console.log('list', typeof list, typeof result[role]);
                        list.push(...commons.slice());
                        result[role].templates.push(...list);
                    } catch (e) {
                        console.error(e);
                    }
                }
            } else {
                opts.verbose && console.info("...no templates");
            }
            if (mod.paths.styles) {
                let commons;
                try {
                    commons = await loadTemplates(
                        mod.paths.styles,
                        COMMON_TEMPLATES,
                        STYLES_EXT
                    );
                } catch (e) {
                    console.error(e);
                    commons = [];
                }
                //console.log('commons', commons);
                for (let i = 0; i < roles.length; i++) {
                    try {
                        //console.log('loadTemplates', typeof loadTemplates);
                        let role = roles[i],
                            list = await loadTemplates(
                                mod.paths.styles,
                                role,
                                STYLES_EXT
                            );
                        //console.log('list', typeof list, typeof result[role]);
                        list.push(...commons);
                        result[role].styles.push(...list);
                    } catch (e) {
                        console.error(e);
                    }
                }
            } else {
                opts.verbose && console.info("...no styles");
            }
        }
    } catch (e) {
        console.error(e);
    }
    return result;
}

function initList(roles, pathTo) {
    let list = {};
    for (let i = 0; i < roles.length; i++) {
        list[roles[i]] = {
            templates: [],
            controllers: [],
            styles: [],
        };
        if (pathTo) {
            list[roles[i]].controllers.push(pathTo);
        }
    }
    return list;
}

async function loadFrontModules() {
    let result = {};
    try {
        let { modsOptions, roles, pathToModules } = arguments[0];
        for (let i = 0; i < roles.length; i++) {
            result[roles[i]] = {
                templates: [],
                controllers: [],
                styles: [],
            };
        }
        let modulesDirList = await listDir(pathToModules);
        if (modulesDirList.indexOf("common") > -1) {
            result = initList(roles, path.join(pathToModules, "common"));
        }
        //console.log(modulesDirList);
        for (let i = 0; i < roles.length; i++) {
            modulesDirList = await listDir(path.join(pathToModules, roles[i]));
            //console.log(path.join(pathToModules, roles[i]), modulesDirList);
            for (let t = 0; t < modulesDirList.length; t++) {
                result[roles[i]].controllers.push(
                    path.join(pathToModules, roles[i], modulesDirList[t])
                );
            }
            //console.log(result[roles[i]].controllers);
            //console.log('role:', roles[i]);
            result[roles[i]].templates = await loadTemplatesForFront(
                pathToModules,
                roles[i]
            );
            result[roles[i]].styles = await loadTemplatesForFront(
                pathToModules,
                roles[i],
                COMMON_TEMPLATES,
                STYLES_EXT
            );
            //console.log('templates in there', result[roles[i]].templates);
        }
    } catch (e) {
        console.error("loadFrontModules error", e);
    }
    return result;
}

async function loadServerModulesFromDir() {
    let list = {};
    try {
        let { modsOptions, roles, pathToModules } = arguments[0];
        let modulesDirList = await listDir(pathToModules);
        for (let i = 0; i < modulesDirList.length; i++) {
            let moduleName = modulesDirList[i];
            console.info("Import from", moduleName);
            let modOptions =
                modsOptions && modsOptions.hasOwnProperty[moduleName]
                    ? modsOptions[moduleName]
                    : {};
            let pathToModule = path.join(pathToModules, moduleName);
            let partList = await loadServerModule({
                pathToModule,
                roles,
                modName: moduleName,
                modOptions,
            });
            list = deepMerge(list, partList);
        }
    } catch (e) {
        console.error(e);
    }
    return list;
}

function getFileNameByTemplateAndRole(template, role) {
    let parts = path.parse(template);
    return parts.base.replace("!", role);
}

function initListByRoles(list, roles) {
    for (let i = 0; i < roles.length; i++) {
        list[roles[i]] = {
            controllers: [],
            templates: [],
            styles: [],
        };
    }
}

async function build_Server(pathToRoot, roles, targetName, targetManifest) {
    let list = {};
    initListByRoles(list, roles);
    ////searching for app.js template
    ////searching modules
    let pathTo = {
        nodeModules:
            targetManifest.modules && targetManifest.modules.serverModulesDir
                ? path.join(pathToRoot, targetManifest.modules.serverModulesDir)
                : undefined,
        frontModules:
            targetManifest.modules && targetManifest.modules.frontModulesDir
                ? path.join(pathToRoot, targetManifest.modules.frontModulesDir)
                : undefined,
    };
    if (targetManifest.modules) {
        /////searching for npm modules
        if (targetManifest.modules.npm) {
            let mass = targetManifest.modules.npm;
            console.info("Import from npm modules:");
            for (let t in mass) {
                console.info(t, "...");
                let partList = await loadNPMModule({
                    roles,
                    modName: t,
                    modOptions: mass[t],
                });
                list = deepMerge(list, partList);
            }
        } else {
            console.info("no npm modules in manifest");
        }
        /////searching for server modules
        if (targetManifest.modules.serverModulesDir) {
            console.info(
                "Import custom server modules from",
                targetManifest.modules.serverModulesDir,
                ":"
            );
            let partList = await loadServerModulesFromDir({
                pathToModules: path.join(
                    pathToRoot,
                    targetManifest.modules.serverModulesDir
                ),
                roles,
                modsOptions: targetManifest.modules.server,
            });
            list = deepMerge(list, partList);
        } else {
            console.info("no custom server modules in manifest");
        }
        /////searching for front modules
        if (targetManifest.modules.frontModulesDir) {
            console.info(
                "Import custom front modules from",
                targetManifest.modules.frontModulesDir,
                ":"
            );
            try {
                let mass = targetManifest.modules.front;
                let pathToModules = path.join(
                    pathToRoot,
                    targetManifest.modules.frontModulesDir
                );
                let partList = await loadFrontModules({
                    pathToModules,
                    roles,
                    modsOptions: mass,
                });
                list = deepMerge(list, partList);
            } catch (e) {
                console.error(e);
            }
        } else {
            console.info("no front modules in manifest");
        }
    } else {
        console.info("no modules in manifest");
    }
    opts.verbose && console.log("List:", list);
    ////forming index.js and rollup.js
    for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        if (opts.role !== null && opts.role !== role) {
            continue;
        }
        try {
            let indexFile = path.join(
                pathToRoot,
                targetManifest.src,
                getFileNameByTemplateAndRole(targetManifest.index, role)
            );
            let rollupFile = path.join(
                pathToRoot,
                targetManifest.root,
                getFileNameByTemplateAndRole(targetManifest.rollup, role)
            );
            let bundleFile = path.join(
                pathToRoot,
                targetManifest.build,
                getFileNameByTemplateAndRole(
                    targetManifest.output || "!.js",
                    role
                )
            );
            //let templateFile = path.join(pathToRoot, targetManifest.build, role + '.html');
            await lib.renderScript(
                path.join(pathToRoot, targetManifest.index),
                {
                    mods: list[role].controllers,
                    scss: list[role].styles,
                    env: opts.environment,
                    role,
                },
                indexFile
            );
            await lib.renderScript(
                path.join(pathToRoot, targetManifest.rollup),
                {
                    appName: targetManifest.name,
                    inputPath: indexFile,
                    outputPath: bundleFile,
                    env: opts.environment,
                    role,
                },
                rollupFile
            );
            //let result =
            child_process.execFileSync(
                "node",
                [opts.rollup, "-c", rollupFile],
                {
                    env: {
                        NODE_ENV: opts.environment,
                    },
                }
            );
            //console.log(result.toString());
            //await lib.joinToFile(templateFile, list[role].templates);
        } catch (e) {
            console.error(e);
        }
    }
    ////executing rollup
}

//loading manifest file

console.log("config path", configName);
config = lib.getConfReader(configName);

async function render() {
    //searchig for targets
    if (
        config.get("targets") &&
        Object.keys(config.get("targets")).length > 0
    ) {
        //cycling through targets
        for (let target in config.get("targets")) {
            let targetConfig = config.get("targets")[target];
            if (targetConfig && targetConfig.builder) {
                //if target type is server
                switch (targetConfig.builder) {
                    case "server":
                        await build_Server(
                            path.dirname(configName),
                            targetConfig.roles,
                            target,
                            targetConfig
                        );
                        break;
                }
            }
        }
    }
}

render()
    .then(() => {
        process.exit(0);
    })
    .catch(console.error);

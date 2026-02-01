import Logger from "./log.mjs";

const TEMPLATE_OPTIONS = "__options__";
const VAR_PREFIX = "__";

import * as Readers from "../readers/index.mjs";
import inquirer from "inquirer";

async function readArgs(structure, config) {
    let result = {};
    if (Object.hasOwn(structure, "args")) {
        for (let entry of structure.args) {
            if (!Object.hasOwn(config, entry)) {
                Logger.log(
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

function isFilename(name, descr) {
    if (descr.type === "file") {
        return true;
    } else if (descr.type === "dir") {
        return false;
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

export {
    readArgs,
    isFilename,
    isVariable,
    getVariableName,
    dirRequiresAbsentModules,
    dirRequiresNotNullArgs,
};

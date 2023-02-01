import { resolve } from "node:path";
import { firstLetterToLower } from "../../../src/common.js";
import { createDir, createDirContent, renderFile } from "./fs.mjs";
import { ProjectSubStructures } from "./structures.mjs";
import * as Readers from "../readers/index.mjs";
import * as Renderers from "../renderers/index.mjs";
import inquirer from "inquirer";
import Options from "./opts.mjs";

async function createFrontModule(modules_dir, config) {
    const ModuleName = await Readers.ModuleName(inquirer);
    const moduleName = firstLetterToLower(ModuleName);
    const targetRoles = await Readers.roles(inquirer);
    for (let role of targetRoles) {
        const targetModuleRoleDir = resolve(modules_dir, role, moduleName);
        console.log("creating directory for role", role);
        await createDir(targetModuleRoleDir);
        await Renderers.controllersIndex(
            targetModuleRoleDir,
            [],
            { ...config, roles: targetRoles },
            renderFile,
            Options.PATH_TMPL
        );
    }
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
                Options.PATH_TMPL
            );
        } else {
            await Renderers.frontModuleRoleMain(
                targetFrontModuleDir,
                { ...config, roleName: role },
                renderFile,
                Options.PATH_TMPL
            );
        }
    }
}

export { createBootstrapFrontModule, createFrontModule };

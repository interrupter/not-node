import { isAbsolute, resolve } from "node:path";

import { Option } from "commander";
import inquirer from "inquirer";

import {
    createFileContent,
    createDir,
    createDirContent,
    makeScriptExecutable,
    installPackages,
    buildClientSideScripts,
} from "../lib/fs.mjs";

import { postStartupInstructions } from "../lib/messages.mjs";

//reads vars from user input, provides defaults
import * as Readers from "../readers/index.mjs";
import * as Renderers from "../renderers/index.mjs";

import { ProjectStructure } from "../lib/structures.mjs";

import Logger from "../lib/log.mjs";
import Options from "../lib/opts.mjs";
import { createServerModule } from "../lib/module.server.mjs";
import { createBootstrapFrontModule } from "../lib/module.front.mjs";

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

export default (program, { CWD }) => {
    program
        .command("create")
        /*.addOption(
            new Option("-d, --dir <dir>").default(
                CWD,
                "current working directory"
            )
        )*/
        .argument("<dir>", "target dir")
        .addOption(
            new Option("-v, --verbose").default(false, "extensive output")
        )
        .description(
            "create application in target directory (create -d [pathToDir])"
        )
        .action(async (dir, ...opts) => {
            if (!isAbsolute(dir)) {
                dir = resolve(CWD, dir);
            }
            const siteDir = resolve(dir, "./site");
            if (opts.verbose) {
                Logger.setSilent(false);
            }
            console.log("creating project in", dir);
            console.log("creating site in", siteDir);
            const ProjectConfig = {
                path: dir,
            };
            //
            ProjectConfig.AppName = await Readers.AppName(
                inquirer,
                ProjectConfig
            );
            ProjectConfig.appName = await Readers.appName(
                inquirer,
                ProjectConfig
            );
            ProjectConfig.hostname = await Readers.hostname(
                inquirer,
                ProjectConfig
            );
            ProjectConfig.roles = await Readers.roles(inquirer, ProjectConfig);
            ProjectConfig.rolesSecondary = await Readers.rolesSecondary(
                inquirer,
                ProjectConfig
            );
            ProjectConfig.modules = await Readers.modules(
                inquirer,
                ProjectConfig
            );
            ProjectConfig.nginx = await Readers.nginx(inquirer, ProjectConfig);
            ProjectConfig.pm2 = await Readers.pm2(inquirer, ProjectConfig);
            ProjectConfig.deploy = await Readers.deploy(
                inquirer,
                ProjectConfig
            );
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
            await createDir(dir);
            await createDirContent(dir, ProjectStructure, ProjectConfig);
            await createProjectToolsAndConfigs(dir, ProjectConfig);
            const PATH_MODULES_SERVER = resolve(
                dir,
                Options.DEFAULT_SERVER_MODULES_SUB_PATH
            );
            const PATH_MODULES_FRONT = resolve(
                dir,
                Options.DEFAULT_FRONT_MODULES_SUB_PATH
            );
            while (await Readers.isUserNeedCreateServerModule(inquirer)) {
                await createServerModule(PATH_MODULES_SERVER, ProjectConfig);
            }
            if (await Readers.isUserNeedFrontModuleBootstrap(inquirer)) {
                await createBootstrapFrontModule(
                    PATH_MODULES_FRONT,
                    ProjectConfig
                );
            }
            await installPackages(siteDir);
            await buildClientSideScripts(siteDir);
            postStartupInstructions(siteDir, ProjectConfig);
        });
};

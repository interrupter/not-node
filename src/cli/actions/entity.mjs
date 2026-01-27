import { Option } from "commander";
import { resolve } from "node:path";
import { createEntity } from "../lib/entity.mjs";
import Logger from "../lib/log.mjs";
import { loadProjectConfig } from "../lib/project.mjs";
import { getProjectSiteDir, findAllFields } from "../lib/fs.mjs";

export default (program, { CWD }) => {
    program
        .command("entity")
        .addOption(
            new Option("-v, --verbose").default(false, "extensive output")
        )
        .addOption(
            new Option("-d, --dir <dir>").default("", "project site directory")
        )
        .description("adds entity to existing module of project")
        .action(async (opts) => {
            console.log(CWD, opts);
            const siteDir = getProjectSiteDir(opts.dir, CWD);
            console.log("project in", siteDir);
            if (opts.v) {
                Logger.setSilent(false);
            }
            const infoFromManifest = await loadProjectConfig(siteDir);
            const modulesDir = resolve(
                siteDir,
                infoFromManifest.serverModulesDir
            );
            const allFields = await findAllFields(siteDir, modulesDir);
            console.log("creating server module in", modulesDir, allFields);
            const ProjectConfig = {
                path: opts.dir,
                ...infoFromManifest,
            };
            await createEntity(modulesDir, ProjectConfig, allFields);
        });
};

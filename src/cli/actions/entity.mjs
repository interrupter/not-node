import { Option } from "commander";
import { resolve } from "node:path";
import { createEntity } from "../lib/entity.mjs";
import Logger from "../lib/log.mjs";
import { loadProjectConfig } from "../lib/project.mjs";

export default (program, { CWD }) => {
    program
        .command("entity")
        .addOption(
            new Option("-v, --verbose").default(false, "extensive output")
        )
        .description("adds entity to existing module of project")
        .action(async (opts) => {
            console.log(CWD);
            const siteDir = resolve(CWD, "./site");
            if (opts.v) {
                Logger.setSilent(false);
            }
            console.log("project in", opts.dir);
            const infoFromManifest = await loadProjectConfig(siteDir);
            const modulesDir = resolve(
                siteDir,
                infoFromManifest.serverModulesDir
            );
            console.log("creating server module in", modulesDir);
            const ProjectConfig = {
                path: opts.dir,
                ...infoFromManifest,
            };
            await createEntity(modulesDir, ProjectConfig);
        });
};

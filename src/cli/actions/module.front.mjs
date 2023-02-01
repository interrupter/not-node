import { Option } from "commander";
import { resolve } from "node:path";
import Logger from "../lib/log.mjs";
import { createFrontModule } from "../lib/module.front.mjs";
import { loadProjectConfig } from "../lib/project.mjs";
import Options from "../lib/opts.mjs";

export default (program, { CWD }) => {
    program
        .command("front")
        .addOption(
            new Option("-v, --verbose").default(false, "extensive output")
        )
        .description("adds new front module to existing project")
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
                infoFromManifest.frontModulesDir
            );
            Options.roles = infoFromManifest.roles;
            console.log("creating server module in", modulesDir);
            const ProjectConfig = {
                path: opts.dir,
                ...infoFromManifest,
            }; //
            await createFrontModule(modulesDir, ProjectConfig);
        });
};

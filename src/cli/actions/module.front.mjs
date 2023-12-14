import { Option } from "commander";
import { resolve } from "node:path";
import Logger from "../lib/log.mjs";
import { createFrontModule } from "../lib/module.front.mjs";
import { loadProjectConfig } from "../lib/project.mjs";
import { getProjectSiteDir } from "../lib/fs.mjs";
import Options from "../lib/opts.mjs";

export default (program, { CWD }) => {
    program
        .command("front")
        .addOption(
            new Option("-v, --verbose").default(false, "extensive output")
        )
        .addOption(
            new Option("-d, --dir <dir>").default("", "project site directory")
        )
        .description("adds new front module to existing project")
        .action(async (opts) => {
            console.log(CWD);
            const siteDir = getProjectSiteDir(opts.dir, CWD);
            if (opts.v) {
                Logger.setSilent(false);
            }
            console.log("project in", siteDir);
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

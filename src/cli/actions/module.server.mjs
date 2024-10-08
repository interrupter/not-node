import { Option } from "commander";
import { resolve } from "node:path";
import Logger from "../lib/log.mjs";
import { createServerModule } from "../lib/module.server.mjs";
import { loadProjectConfig } from "../lib/project.mjs";
import { getProjectSiteDir, findAllFields } from "../lib/fs.mjs";

export default (program, { CWD }) => {
    program
        .command("server")
        .addOption(
            new Option("-v, --verbose").default(false, "extensive output")
        )
        .addOption(
            new Option("-d, --dir <dir>").default("", "project site directory")
        )
        .description("adds new server module to existing project")
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
                infoFromManifest.serverModulesDir
            );
            const allFields = await findAllFields(siteDir, modulesDir);
            console.log("creating server module in", modulesDir);
            const ProjectConfig = {
                path: opts.dir,
                ...infoFromManifest,
            };
            await createServerModule(modulesDir, ProjectConfig, allFields);
        });
};

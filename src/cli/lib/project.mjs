import { readJSONFile } from "./fs.mjs";

async function loadProjectConfig(siteDir) {
    const fname = `${siteDir}/project.manifest.json`;
    console.log(fname);
    const manifest = await readJSONFile(fname);
    return {
        AppName: manifest.name,
        roles: manifest.targets.server.roles,
        serverModulesDir: manifest.targets.server.modules.serverModulesDir,
        frontModulesDir: manifest.targets.server.modules.frontModulesDir,
        modules: Object.keys(manifest.targets.server.modules.npm),
    };
}

export { loadProjectConfig };

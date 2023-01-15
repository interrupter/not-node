import { resolve } from "node:path";
const TEMPLATE_FILE = "./module.server/layers/routes.ejs";
const TEMPLATE_FILE_MANIFEST = "./module.server/layers/routes.manifest.ejs";
const TEMPLATE_FILE_WS = "./module.server/layers/routes.ws.ejs";

export default async (
    module_layer_dir,
    data,
    config,
    createFileContent,
    PATH_TMPL
) => {
    await createFileContent(
        resolve(PATH_TMPL, TEMPLATE_FILE),
        resolve(module_layer_dir, `${data.modelName}.js`),
        { ...config, ...data }
    );
    await createFileContent(
        resolve(PATH_TMPL, TEMPLATE_FILE_MANIFEST),
        resolve(module_layer_dir, `${data.modelName}.manifest.js`),
        { ...config, ...data }
    );

    if (config.modules.includes("not-ws")) {
        await createFileContent(
            resolve(PATH_TMPL, TEMPLATE_FILE_WS),
            resolve(module_layer_dir, `${data.modelName}.ws.js`),
            { ...config, ...data }
        );
    }
};

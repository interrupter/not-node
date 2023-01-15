import { resolve } from "node:path";
const TEMPLATE_FILE = "./module.server/layers/models.ejs";

export default async (
    module_layer_dir,
    data,
    config,
    createFileContent,
    PATH_TMPL
) => {
    const TMPL_FILE_PATH = resolve(PATH_TMPL, TEMPLATE_FILE);
    const DEST_FILE_PATH = resolve(module_layer_dir, `${data.modelName}.js`);
    const args = { ...config, ...data };
    console.log(JSON.stringify(args, null, 4));
    await createFileContent(TMPL_FILE_PATH, DEST_FILE_PATH, args);
};

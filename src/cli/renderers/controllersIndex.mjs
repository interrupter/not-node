import { resolve } from "node:path";
const CONTROLLER_INDEX_TMPL =
    "./module.server/layers/controllers/role/index.ejs";

export default async (
    module_layer_dir,
    data,
    config,
    createFileContent,
    PATH_TMPL
) => {
    const TMPL_FILE_PATH = resolve(PATH_TMPL, CONTROLLER_INDEX_TMPL);
    const DEST_FILE_PATH = resolve(module_layer_dir, `index.js`);
    await createFileContent(TMPL_FILE_PATH, DEST_FILE_PATH, {
        ...config,
        entities: data,
    });
};

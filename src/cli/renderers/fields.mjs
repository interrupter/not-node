import { resolve } from "node:path";
const TEMPLATES_DIR = "./module.server/layers";

async function renderEntityDataField(createFileContent, SRC, DEST, data) {
    await createFileContent(SRC, DEST, data);
}

export default async (
    module_layer_dir,
    data,
    config,
    createFileContent,
    PATH_TMPL
) => {
    const TMPL_FILE_PATH_DATA = resolve(
        PATH_TMPL,
        TEMPLATES_DIR,
        `fields.data.ejs`
    );
    const DEST_FILE_PATH_DATA = resolve(
        module_layer_dir,
        `_${data.modelName}_data.js`
    );
    await renderEntityDataField(
        createFileContent,
        TMPL_FILE_PATH_DATA,
        DEST_FILE_PATH_DATA,
        { ...config, ...data }
    );
};

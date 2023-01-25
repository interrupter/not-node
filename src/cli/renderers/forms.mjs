import { resolve } from "node:path";
const TEMPLATES_DIR = "./module.server/layers/forms";

async function renderEntityActionForm(createFileContent, SRC, DEST, data) {
    await createFileContent(SRC, DEST, data);
}

export default async (
    module_layer_dir,
    data,
    config,
    createFileContent,
    PATH_TMPL
) => {
    for (let actionName in data.actions) {
        const TMPL_FILE_PATH = resolve(
            PATH_TMPL,
            TEMPLATES_DIR,
            `${actionName}.ejs`
        );
        const DEST_FILE_PATH = resolve(
            module_layer_dir,
            `${data.modelName}.${actionName}.js`
        );
        await renderEntityActionForm(
            createFileContent,
            TMPL_FILE_PATH,
            DEST_FILE_PATH,
            { ...config, ...data }
        );
    }
    const TMPL_FILE_PATH_DATA = resolve(PATH_TMPL, TEMPLATES_DIR, `_data.ejs`);
    const DEST_FILE_PATH_DATA = resolve(
        module_layer_dir,
        `_${data.modelName}_data.js`
    );
    await renderEntityActionForm(
        createFileContent,
        TMPL_FILE_PATH_DATA,
        DEST_FILE_PATH_DATA,
        { ...config, ...data }
    );
};

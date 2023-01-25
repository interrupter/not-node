import { resolve } from "node:path";
const CRUD_CONTROLLER_TMPL = "./module.server/layers/controllers/role/crud.ejs";

export default async (
    module_layer_dir,
    data,
    config,
    createFileContent,
    PATH_TMPL,
    createDir
) => {
    for (let roleName of config.roles) {
        const TARGET_DIR_PATH = resolve(module_layer_dir, roleName);
        await createDir(TARGET_DIR_PATH);
        const TMPL_FILE_PATH = resolve(PATH_TMPL, CRUD_CONTROLLER_TMPL);
        const DEST_FILE_PATH = resolve(
            module_layer_dir,
            roleName,
            `nc${data.ModelName}.js`
        );
        await createFileContent(TMPL_FILE_PATH, DEST_FILE_PATH, {
            ...config,
            ...data,
        });
    }
};

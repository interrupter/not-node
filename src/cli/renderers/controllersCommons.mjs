import { resolve } from "node:path";
const TEMPLATES_DIR = "./module.server/layers/controllers/common";

export default async (
    module_layer_dir,
    entitiesList,
    config,
    createFileContent,
    PATH_TMPL
) => {
    for (let entityData of entitiesList) {
        const TMPL_FILE_PATH = resolve(PATH_TMPL, TEMPLATES_DIR, `crud.ejs`);
        const DEST_FILE_PATH = resolve(
            module_layer_dir,
            `nc${entityData.ModelName}Common.js`
        );
        await createFileContent(TMPL_FILE_PATH, DEST_FILE_PATH, {
            ...config,
            ...entityData,
        });
    }

    if (entitiesList.length) {
        //common validators
        const TMPL_FILE_PATH_VALIDATORS = resolve(
            PATH_TMPL,
            TEMPLATES_DIR,
            `validators.ejs`
        );
        const DEST_FILE_PATH_VALIDATORS = resolve(
            module_layer_dir,
            `validators.js`
        );
        await createFileContent(
            TMPL_FILE_PATH_VALIDATORS,
            DEST_FILE_PATH_VALIDATORS,
            {
                ...config,
                ...entitiesList[0],
            }
        );
        //common service
        const TMPL_FILE_PATH_COMMON_SERVICE = resolve(
            PATH_TMPL,
            TEMPLATES_DIR,
            `service.ejs`
        );
        const DEST_FILE_PATH_COMMON_SERVICE = resolve(
            module_layer_dir,
            `ns${config.ModuleNameHumanReadable}Common.js`
        );
        await createFileContent(
            TMPL_FILE_PATH_COMMON_SERVICE,
            DEST_FILE_PATH_COMMON_SERVICE,
            {
                ...config,
                ...entitiesList[0],
            }
        );
    }
};

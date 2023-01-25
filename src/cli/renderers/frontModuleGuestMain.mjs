import { resolve } from "node:path";
const TEMPLATES_FILE = "./module.front/role/guest.index.ejs";

export default async (module_dir, config, createFileContent, PATH_TMPL) => {
    const TMPL_FILE_PATH = resolve(PATH_TMPL, TEMPLATES_FILE);
    const DEST_FILE_PATH = resolve(module_dir, `index.js`);
    await createFileContent(TMPL_FILE_PATH, DEST_FILE_PATH, {
        ...config,
    });
};

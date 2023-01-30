import { resolve } from "node:path";
const TEMPLATE_FILE = "./project/deploy.ejs";
const envs = ["development", "stage", "production"];

export default async (
    project_layer_dir,
    data,
    config,
    createFileContent,
    makeScriptExecutable
) => {
    for (let environment of envs) {
        if (config.deploy[environment]) {
            const DEST_FILE_PATH = resolve(
                project_layer_dir,
                "./deploy",
                `./${environment}.sh`
            );
            const args = {
                ...config,
                ...data,
                environment,
                hostname: config.hostname[environment],
                deploy: {
                    ...config.deploy[environment],
                },
            };
            await createFileContent(
                DEST_FILE_PATH,
                {
                    tmpl: TEMPLATE_FILE,
                    args: ["AppName", "environment", "deploy"],
                },
                args
            );
            await makeScriptExecutable(DEST_FILE_PATH);
        }
    }
};

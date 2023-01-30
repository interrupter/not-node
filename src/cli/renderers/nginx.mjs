import { resolve } from "node:path";
const TEMPLATE_FILE = "./project/nginx.ejs";
const envs = ["development", "stage", "production"];

function getPath(project_layer_dir, config, environment) {
    if (config.deploy && config.deploy[environment]) {
        return config.deploy[environment].path;
    }
    return project_layer_dir;
}

export default async (project_layer_dir, data, config, createFileContent) => {
    for (let environment of envs) {
        const DEST_FILE_PATH = resolve(
            project_layer_dir,
            "./nginx",
            `./${environment}.conf`
        );
        const args = {
            ...config,
            ...data,
            environment,
            hostname: config.hostname[environment],
            path: getPath(project_layer_dir, config, environment),
        };
        await createFileContent(
            DEST_FILE_PATH,
            {
                tmpl: TEMPLATE_FILE,
                args: [
                    "AppName",
                    "environment",
                    "nginx",
                    "ws",
                    "ssl",
                    "path",
                    "hostname",
                    "port",
                ],
            },
            args
        );
    }
};

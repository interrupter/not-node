import { resolve } from "node:path";
const TEMPLATE_FILE = "./project/pm2.ejs";
const envs = ["development", "stage", "production"];

export default async (project_layer_dir, data, config, createFileContent) => {
    for (let environment of envs) {
        const DEST_FILE_PATH = resolve(
            project_layer_dir,
            "./pm2",
            `./${environment}.json`
        );
        const args = {
            ...config,
            ...data,
            environment,
            hostname: config.hostname[environment],
        };
        await createFileContent(
            DEST_FILE_PATH,
            {
                tmpl: TEMPLATE_FILE,
                args: [
                    "AppName",
                    "appName",
                    "environment",
                    "nginx",
                    "pm2",
                    "ssl",
                    "ws",
                    "path",
                    "hostname",
                    "port",
                    "debugPort",
                    "not_node_reporter",
                    "not_node_monitor",
                    "db",
                ],
            },
            args
        );
    }
};

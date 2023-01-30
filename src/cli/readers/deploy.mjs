import os from "node:os";
const envs = ["development", "stage", "production"];

let cache = {
    user: os.userInfo().username,
    path: "/var/server",
};

function collectData(inquirer, env, config) {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "user",
                message: `${env}: SSH user`,
                default: cache.user || "",
            },
            {
                type: "input",
                name: "hostname",
                message: `${env}: server address`,
                default: config.hostname[env],
            },
            {
                type: "input",
                name: "path",
                message: `${env}: path on remote server`,
                default: cache.path || "",
            },
        ])
        .then((answer) => {
            cache = { ...answer };
            return answer;
        });
}

function collectThisEnv(inquirer, env) {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: `Create deploy script for '${env}'?`,
                default: ["stage", "production"].includes(env),
            },
        ])
        .then(({ enabled }) => enabled);
}

async function collectForAllEnvs(inquirer, config) {
    let result = {};
    cache.path = `/var/server/${config.appName}`;
    for (let env of envs) {
        if (await collectThisEnv(inquirer, env)) {
            result[env] = await collectData(inquirer, env, config);
        } else {
            result[env] = false;
        }
    }
    return result;
}

export default (inquirer, config) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Create deploy scripts?",
                default: true,
            },
        ])
        .then((answer) => {
            if (answer.enabled) {
                return collectForAllEnvs(inquirer, config);
            } else {
                return false;
            }
        });
};

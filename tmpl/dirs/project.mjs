export default {
    site: {
        content: "app",
    },
    deploy: {
        ifArgs: ["deploy"],
    },
    nginx: {
        ifArgs: ["nginx"],
    },
    pm2: {
        ifArgs: ["pm2"],
    },
    ".envs": {
        type: "dir",
        content: {
            development: {
                type: "file",
                tmpl: "project/env.ejs",
                args: [
                    "init_root_user",
                    "not_node_monitor",
                    "not_node_reporter",
                    "db",
                    "user",
                    "session",
                    "secret",
                    "modules",
                    "ws",
                ],
            },
            stage: {
                type: "file",
                tmpl: "project/env.ejs",
                args: [
                    "init_root_user",
                    "not_node_monitor",
                    "not_node_reporter",
                    "db",
                    "user",
                    "session",
                    "secret",
                    "modules",
                    "ws",
                ],
            },
            production: {
                type: "file",
                tmpl: "project/env.ejs",
                args: [
                    "init_root_user",
                    "not_node_monitor",
                    "not_node_reporter",
                    "db",
                    "user",
                    "session",
                    "secret",
                    "modules",
                    "ws",
                ],
            },
        },
    },
};

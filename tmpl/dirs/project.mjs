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
        content: {
            development: {
                tmpl: "project/env.ejs",
                args: [
                    "init_root_user",
                    "not_node_monitor",
                    "not_node_reporter",
                    "db",
                    "session",
                    "secret",
                    "modules",
                    "ws",
                ],
            },
            stage: {
                tmpl: "project/env.ejs",
                args: [],
            },
            production: {
                tmpl: "project/env.ejs",
                args: [],
            },
        },
    },
};

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
    ".env": {
        tmpl: "project/env.ejs",
        args: ["init_root_user", "not_node_monitor", "not_node_reporter"],
    },
};

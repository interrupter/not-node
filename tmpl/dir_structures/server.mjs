const EMPTY_CONFIG = "app/config/other.ejs";
export default {
    config: {
        content: {
            "common.json": {
                tmpl: "app/config/common.ejs",
                args: [
                    "hostname",
                    "port",
                    "cors",
                    "ssl",
                    "secret",
                    "session",
                    "db",
                    "modules",
                    "filter",
                    "roles",
                    "rolesSecondary",
                    "user",
                    "ws",
                ],
            },
            "development.json": {
                tmpl: EMPTY_CONFIG,
                args: ["hostname"],
                options: {
                    ENV: "development",
                },
            },
            "stage.json": {
                tmpl: EMPTY_CONFIG,
                args: ["hostname"],
                options: {
                    ENV: "stage",
                },
            },
            "production.json": {
                tmpl: EMPTY_CONFIG,
                args: ["hostname"],
                options: {
                    ENV: "production",
                },
            },
        },
    },
    modules: {},
    routes: {},
    views: {},
    libs: {},
    ws: {
        content: {
            "auth.js": {
                tmpl: "app/ws/auth.ejs",
            },
            "index.js": {
                tmpl: "app/ws/index.ejs",
            },
        },
        ifModules: ["not-ws"],
    },
    "app.js": {
        tmpl: "app/app.ejs",
        args: [],
    },
    "index.js": {
        tmpl: "app/index.ejs",
        args: [],
    },
};

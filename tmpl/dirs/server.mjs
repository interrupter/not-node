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
                    "nginx",
                ],
            },
            "development.json": {
                tmpl: EMPTY_CONFIG,
                args: ["hostname", "nginx"],
                options: {
                    ENV: "development",
                },
            },
            "stage.json": {
                tmpl: EMPTY_CONFIG,
                args: ["hostname", "nginx"],
                options: {
                    ENV: "stage",
                },
            },
            "production.json": {
                tmpl: EMPTY_CONFIG,
                args: ["hostname", "nginx"],
                options: {
                    ENV: "production",
                },
            },
        },
    },
    modules: {},
    routes: {
        content: {
            "index.js": {
                tmpl: "app/routes/index.ejs",
                args: ["AppName", "AppDescription", "modules", "roles"],
            },
            "site.js": {
                tmpl: "app/routes/site.ejs",
                args: ["AppName", "AppDescription", "modules", "roles"],
            },
        },
    },
    views: {
        content: {
            admin: {
                content: {
                    "foot.pug": {
                        tmpl: "app/views/admin/foot.ejs",
                    },
                    "head.pug": {
                        tmpl: "app/views/admin/head.ejs",
                    },
                    "menu.pug": {
                        tmpl: "app/views/admin/menu.ejs",
                    },
                },
            },
            parts: {
                content: {
                    "overview.pug": {
                        tmpl: "app/views/parts/overview.ejs",
                    },
                    "menu.pug": {
                        tmpl: "app/views/parts/menu.ejs",
                    },
                    "header.pug": {
                        tmpl: "app/views/parts/header.ejs",
                    },
                    "header.ios.pug": {
                        tmpl: "app/views/parts/header.ios.ejs",
                    },
                    "header.android.pug": {
                        tmpl: "app/views/parts/header.android.ejs",
                    },
                },
            },
            "admin.pug": {
                tmpl: "app/views/admin.ejs",
            },
            "dashboard.pug": {
                tmpl: "app/views/dashboard.ejs",
            },
            "index.pug": {
                tmpl: "app/views/index.ejs",
                args: ["hostname"],
                options: {
                    ENV: "production",
                },
            },
        },
    },
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

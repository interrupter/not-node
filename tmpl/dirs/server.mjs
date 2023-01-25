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
            "login.pug": {
                tmpl: "app/views/login.ejs",
                args: ["hostname"],
                options: {
                    ENV: "production",
                },
            },
            "register.pug": {
                tmpl: "app/views/register.ejs",
                args: ["hostname"],
                options: {
                    ENV: "production",
                },
            },
            "site.pug": {
                tmpl: "app/views/site.ejs",
                args: ["hostname"],
                options: {
                    ENV: "production",
                },
            },
        },
    },
    libs: {
        content: {
            "headers.js": {
                tmpl: "app/libs/headers.ejs",
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

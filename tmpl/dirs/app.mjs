export default {
    app: {
        content: {
            front: {
                content: "front",
            },
            server: {
                content: "server",
            },
            static: {
                content: "static",
            },
        },
    },
    bin: {
        content: {
            "build.sh": "app/build.sh",
        },
    },
    "project.manifest.json": {
        tmpl: "app/project.manifest.ejs",
        args: ["AppName", "roles", "modules"],
    },
    "package.json": {
        tmpl: "app/package.ejs",
        args: ["AppName", "appName", "AppDescription"],
    },
    ".babelrc": "app/.babelrc",
    ".eslintignore": "app/.eslintignore",
    ".eslintrc.json": "app/.eslintrc.json",
    ".gitignore": "app/.gitignore",
};

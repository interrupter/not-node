export default {
    "index.js": {
        tmpl: "module.server/index.ejs",
        args: ["moduleLayers"],
    },
    src: {
        content: {
            "const.js": {
                tmpl: "module.server/const.ejs",
                args: ["ModuleName"],
            },
        },
    },
};

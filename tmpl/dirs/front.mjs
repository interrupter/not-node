export default {
    build: {},
    src: {},
    tmpl: {
        content: {
            "index.!.mjs": {
                tmpl: "app/front/index.!.ejs",
                args: ["not_node_reporter"],
            },
            "rollup.!.mjs": {
                tmpl: "app/front/rollup.!.ejs",
                args: [],
            },
        },
    },
    "build.env.js": {
        tmpl: "app/front/build.env.ejs",
        args: [],
    },
};

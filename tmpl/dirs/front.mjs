export default {
    build: {},
    src: {},
    tmpl: {
        content: {
            "index.!.js": {
                tmpl: "app/front/index.!.ejs",
                args: ["not_node_reporter"],
            },
            "rollup.!.js": {
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

export default {
    build: {},
    src: {},
    "index.!.js": {
        tmpl: "app/front/index.!.ejs",
        args: ["not_node_reporter"],
    },
    "rollup.!.js": {
        tmpl: "app/front/rollup.!.ejs",
        args: [],
    },
};

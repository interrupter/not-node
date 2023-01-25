export default {
    "ws.client.js": {
        tmpl: "module.server/layers/controllers/common/ws.client.ejs",
        ifModules: ["not-ws"],
        args: [],
    },
};

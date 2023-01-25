export default {
    common: {
        content: {
            "index.js": {
                tmpl: "module.front/common/index.ejs",
                args: ["modules", "AppName"],
            },
            "ncInit.js": {
                tmpl: "module.front/common/ncInit.ejs",
                args: ["modules", "AppName"],
            },
            "ws.client.main.js": {
                tmpl: "module.front/common/ws.client.main.ejs",
                ifModules: ["not-ws"],
                args: ["modules", "AppName"],
            },
        },
    },
};

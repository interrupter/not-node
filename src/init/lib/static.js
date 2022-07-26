const path = require("path");

const DEFAULT_ROLES = ["root", "admin", "client", "user", "guest"];

module.exports = class InitStatic {
    static serveStatic = require("serve-static");

    static getUserRole(req) {
        if (req.user && req.user.role) {
            return req.user.role;
        } else {
            return "guest";
        }
    }

    static selectVersion(config, req, ext) {
        const rolesPriority =
            config.get("user:roles:priority") || DEFAULT_ROLES;
        const userRole = InitStatic.getUserRole(req);
        const frontAppRoot = config.get("path:front");
        for (let role of rolesPriority) {
            if (userRole.indexOf(role) > -1) {
                return path.join(frontAppRoot, `${role}.${ext}`);
            }
        }
        return path.join(frontAppRoot, `guest.${ext}`);
    }

    static createStaticFrontServer(ext, { config, options /*, master*/ }) {
        return (req, res, next) => {
            try {
                const frontApp = InitStatic.selectVersion(config, req, ext);
                let pathTo = path.resolve(options.pathToApp, frontApp);
                return InitStatic.serveStatic(pathTo)(req, res, next);
            } catch (e) {
                next(e);
            }
        };
    }

    async run({ config, options, master, emit }) {
        await emit("static.pre", { config, options, master });
        master.getServer().use(
            "/front/(:role).js",
            InitStatic.createStaticFrontServer("js", {
                config,
                options,
                master,
            })
        );
        master.getServer().use(
            "/front/(:role).css",
            InitStatic.createStaticFrontServer("css", {
                config,
                options,
                master,
            })
        );
        await emit("static.post", { config, options, master });
    }
};

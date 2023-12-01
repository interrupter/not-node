"use strict";

const serveStatic = require("serve-static");
const log = require("not-log")(module, "not-node//init//routes");
const { notError, notValidationError, notRequestError } = require("not-error");

module.exports = class InitRoutes {
    static finalError({ master }) {
        return (err, req, res, next) => {
            //reportable errors from known cases
            if (err instanceof notError) {
                master.getApp().report(err);
                //if request params - ok, but result is not
                if (err instanceof notRequestError) {
                    if (err.getRedirect()) {
                        return res.redirect(err.getRedirect());
                    } else {
                        return res.status(err.getCode()).json({
                            status: "error",
                            message: err.getResult().message,
                            errors: err.getResult().errors,
                        });
                    }
                    //bad request params
                } else if (err instanceof notValidationError) {
                    return res.status(400).json({
                        status: "error",
                        message: err.message,
                        errors: err.getFieldsErrors(),
                    });
                }
            }
            //other cases
            if (err instanceof Error && res && res.status && res.json) {
                res.status(err.statusCode || 500);
                //reporting as unknown
                master
                    .getApp()
                    .report(
                        new notError(
                            `Internal error(${res.statusCode}): %${req.url} - %${err.message}`,
                            {},
                            err
                        )
                    );
                res.json({
                    status: "error",
                    message: err.message,
                });
            } else {
                log?.error("Unknown error:", err);
                res.status(500).json({
                    status: "error",
                });
            }
            next();
        };
    }

    async run({ master, config, options }) {
        log?.info("Setting up routes...");
        //pages rendering
        await master.getApp().execInModules("registerPagesRoutes", master);
        //api first
        master.getApp().expose(master.getServer());
        //user defined pages
        require(options.routesPath)(master.getServer(), master.getApp());
        master.getServer().use(serveStatic(config.get("staticPath")));
        master.getServer().use(options.indexRoute);
        master.getServer().use(
            InitRoutes.finalError({
                master,
            })
        );
    }
};

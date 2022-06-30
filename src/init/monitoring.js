const Log = require("not-log")(module, "not-node//init");

module.exports = class InitMonitoring {
    async run() {
        const monitor = require("not-monitor").monitor;
        monitor.on("afterReportError", (err) => {
            Log.error("Report error", err.message);
        });
        Log.log("Development monitor initialized");
    }
};

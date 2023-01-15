import { DEFAULT_NODE_API_URL } from "../const.mjs";

function collectNodeMonitor(inquirer) {
    return inquirer.prompt([
        {
            type: "input",
            name: "report_key",
            message: "Report API Key",
        },
        {
            type: "input",
            name: "report_url",
            message: "Report API URL",
            default: DEFAULT_NODE_API_URL,
        },
        {
            type: "input",
            name: "report_interval",
            message: "Report Interval (sec)",
            default: 60,
        },
        {
            type: "input",
            name: "interval",
            message: "Monitor measurment interval (ms)",
            default: 5000,
        },
    ]);
}

export default (inquirer) => {
    inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Init monitoring",
                default: false,
            },
        ])
        .then(({ enabled }) => {
            if (enabled) {
                return collectNodeMonitor(inquirer);
            } else {
                return false;
            }
        });
};

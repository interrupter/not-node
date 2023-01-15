import { DEFAULT_NODE_API_URL } from "../const.mjs";

function collectNodeReporter(inquirer) {
    return inquirer.prompt([
        {
            type: "input",
            name: "key",
            message: "Report API Key",
        },
        {
            type: "input",
            name: "url_node",
            message: "Report API URL for server side",
            default: DEFAULT_NODE_API_URL,
        },
        {
            type: "input",
            name: "url_browser",
            message: "Report API URL for client side",
            default: DEFAULT_NODE_API_URL,
        },
    ]);
}

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Init error reporting",
                default: false,
            },
        ])
        .then((answer) => {
            if (answer.enabled) {
                return collectNodeReporter(inquirer);
            } else {
                return false;
            }
        });
};

import { getDefaultPortByShift } from "../const.mjs";

export default (inquirer, config) => {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "debugPort",
                message: "Debug port number for development env",
                default: getDefaultPortByShift(config.port, 2),
            },
        ])
        .then(({ debugPort }) => {
            return debugPort;
        });
};

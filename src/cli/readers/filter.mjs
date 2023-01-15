function collectData(inquirer) {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "size",
                message: "Filter page size",
                default: 15,
            },
        ])
        .then((answer) => {
            answer.pager = { size: answer.size };
            return answer;
        });
}

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Configure Filter module?",
                default: false,
            },
        ])
        .then((answer) => {
            if (answer.enabled) {
                return collectData(inquirer);
            } else {
                return false;
            }
        });
};

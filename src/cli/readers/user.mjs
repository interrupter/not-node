const DEFAULT_CONFIG = {
    restrict: {
        registration: false,
    },
    tokenTTL: 3600,
};

function collectRestrictions(inquirer) {
    return inquirer.prompt([
        {
            type: "confirm",
            name: "registration",
            message: "Restrict registration?",
            default: false,
        },
    ]);
}

function askToCollectRestrictions(inquirer) {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Set User module restrictions?",
                default: false,
            },
        ])
        .then((answer) => {
            return answer.enabled;
        });
}

function collectData(inquirer) {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "tokenTTL",
                message: "User token TTL (sec)",
                default: 3600,
            },
        ])
        .then(async (answer) => {
            if (await askToCollectRestrictions(inquirer)) {
                answer.restrict = await collectRestrictions(inquirer);
            }
            return answer;
        });
}

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Configure User module?",
                default: false,
            },
        ])
        .then((answer) => {
            if (answer.enabled) {
                return collectData(inquirer);
            } else {
                return DEFAULT_CONFIG;
            }
        });
};

export default async (inquirer, config) => {
    const result = [];
    let finished = false;
    while (!finished) {
        try {
            await inquirer
                .prompt([
                    {
                        type: "autocomplete",
                        message: "Enter field name you want to be in model",
                        name: "fieldname",
                        source: async (answers, input = "") => {
                            let searchResults = [];
                            try {
                                if (typeof input == "string") {
                                    searchResults = config.availableFields
                                        .filter((s) =>
                                            s.fullName
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        )
                                        .map((r) => r.fullName);
                                }
                            } catch (e) {
                                console.error(e);
                            }
                            return searchResults;
                        },
                    },
                ])
                .then((answer) => {
                    result.push(answer.fieldname.trim());
                });

            finished = await inquirer
                .prompt([
                    {
                        type: "confirm",
                        name: "oneMore",
                        message: `Add another one field to [${result.join(
                            ","
                        )}] (default: true)?`,
                        default: true,
                    },
                ])
                .then((answer) => !answer.oneMore);
        } catch (e) {
            console.error(e);
            return result;
        }
    }
    return result;
};

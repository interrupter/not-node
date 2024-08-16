export default async (inquirer, config) => {
    const result = [];
    let finished = false;
    while (!finished) {
        try {
            let fieldtype = "";
            let fieldname = "";
            await inquirer
                .prompt([
                    {
                        type: "autocomplete",
                        message: "Enter model field type",
                        name: "fieldtype",
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
                    fieldtype = answer.fieldtype.trim();
                });
            await inquirer
                .prompt([
                    {
                        message: "Enter model field name",
                        name: "fieldname",
                        default:
                            fieldtype.indexOf("//") > 0
                                ? fieldtype.split("//")[1]
                                : fieldtype,
                        validate: (str) => {
                            if (str.indexOf("//") > -1) {
                                return "Should not have // in it";
                            }
                            if (!/[_A-z0-9]+/.test(str)) {
                                return "Should comply to [_A-z0-9]+";
                            }
                            return true;
                        },
                    },
                ])
                .then((answer) => {
                    fieldname = answer.fieldname.trim();
                });
            result.push([fieldname, fieldtype]);
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

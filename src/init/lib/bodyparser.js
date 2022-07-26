module.exports = class InitBodyparser {
    async run({ /*options, config,*/ master }) {
        //HTTP input formating
        const bodyParser = require("body-parser");
        master.getServer().use(bodyParser.json({ limit: "150mb" }));
        // for parsing application/json
        master.getServer().use(
            bodyParser.urlencoded({
                limit: "150mb",
                extended: true,
            })
        );
        // for parsing application/x-www-form-urlencode
    }
};

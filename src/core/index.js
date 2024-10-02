const { generatePaths } = require("../common");
const { MODULE_NAME } = require("./const.js");

module.exports = {
    name: MODULE_NAME,
    paths: generatePaths(["fields", "locales"], __dirname),
};

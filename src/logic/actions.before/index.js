const ActionsSetsLibrary = require("../actions.lib.js");

const ActionsBefore = new ActionsSetsLibrary();

ActionsBefore.add("ownage", require("./ownage"));
ActionsBefore.add("standartQueries", require("./standart.queries.js"));

module.exports = ActionsBefore;

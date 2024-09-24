const ActionsSetsLibrary = require("../actions.lib.js");

const ActionsBefore = new ActionsSetsLibrary();

ActionsBefore.add("ownage", require("./ownage"));
ActionsBefore.add("standartQueries", require("./standart.queries.js"));
ActionsBefore.add("populate", require("./populate"));

module.exports = ActionsBefore;

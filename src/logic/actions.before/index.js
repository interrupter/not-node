const ActionsSetsLibrary = require("../actions.lib.js");

const ActionsBefore = new ActionsSetsLibrary();

ActionsBefore.add("ownage", require("./ownage"));

module.exports = ActionsBefore;

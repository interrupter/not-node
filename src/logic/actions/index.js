const ActionsSetsLibrary = require("../actions.lib");

let actionsSetsLibrary = new ActionsSetsLibrary();
actionsSetsLibrary.add("standart", require("./standart"));
actionsSetsLibrary.add("increment", require("./increment"));

module.exports = actionsSetsLibrary;

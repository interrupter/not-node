const ActionsSetsLibrary = require("../actions.lib");

let actionsSetsLibrary = new ActionsSetsLibrary();

actionsSetsLibrary.add("standart", require("./standart"));

actionsSetsLibrary.add("standartOwn", require("./standart.own"));

actionsSetsLibrary.add("increment", require("./increment"));

module.exports = actionsSetsLibrary;

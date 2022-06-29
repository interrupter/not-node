const { getIP } = require("../auth"),
	configInit = require("not-config"),
	{ sayForModule } = require("not-locale"),
	LogInit = require("not-log");

module.exports = ({ target, MODULE_NAME, MODEL_NAME, ACTION_NAME }) => {
	const Log = LogInit(target, `${MODEL_NAME}/Forms'`);
	const say = sayForModule(MODULE_NAME);

	const config = configInit.readerForModule(MODULE_NAME);
	return {
		getIP,
		FORM_NAME: `${MODULE_NAME}:${ACTION_NAME}Form`,
		Log,
		say,
		config,
	};
};

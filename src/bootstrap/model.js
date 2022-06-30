const configInit = require("not-config"),
    { sayForModule } = require("not-locale"),
    LogInit = require("not-log");

module.exports = ({ target, MODULE_NAME, MODEL_NAME }) => {
    const Log = LogInit(target, `${MODEL_NAME}/Models'`);
    const say = sayForModule(MODULE_NAME);

    const config = configInit.readerForModule(MODULE_NAME);
    return {
        Log,
        say,
        config,
    };
};

const getApp = require("../getApp.js"),
    configInit = require("not-config"),
    { sayForModule, modulePhrase } = require("not-locale"),
    LogInit = require("not-log");

module.exports = ({
    target,
    MODULE_NAME,
    MODEL_NAME,
    USER_MODEL_NAME = "not-user//User",
}) => {
    const Log = LogInit(target, `${MODULE_NAME}/Logic/${MODEL_NAME}`);
    const say = sayForModule(MODULE_NAME);
    const phrase = modulePhrase(MODULE_NAME);
    const config = configInit.readerForModule(MODULE_NAME);

    const LogAction = (action, identity, params = {}) => {
        Log &&
            Log.log({
                time: new Date(),
                module: MODULE_NAME,
                logic: MODEL_NAME,
                action,
                ...identity,
                params,
            });
    };

    return {
        Log,
        LogAction,
        say,
        phrase,
        config,
        MODULE_NAME,
        MODEL_NAME,
        USER_MODEL_NAME,
        getModel() {
            return getApp().getModel(`${MODULE_NAME}//${MODEL_NAME}`);
        },
        getModelSchema() {
            return getApp().getModelSchema(`${MODULE_NAME}//${MODEL_NAME}`);
        },
        getLogic() {
            return getApp().getLogic(`${MODULE_NAME}//${MODEL_NAME}`);
        },
        getModelUser() {
            return getApp().getModel(USER_MODEL_NAME);
        },
    };
};

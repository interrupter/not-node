const getApp = require("../getApp.js"),
  configInit = require("not-config"),
  { sayForModule } = require("not-locale"),
  { objHas } = require("../common"),
  LogInit = require("not-log");

module.exports = ({ target, MODULE_NAME, MODEL_NAME, USER_MODEL_NAME = 'not-user//User' }) => {
  const Log = LogInit(target, `${MODEL_NAME}/Routes'`);
  const say = sayForModule(MODULE_NAME);

  const beforeDecorator = async (req, res, next) => {
    const name = req.notRouteData.actionName;
    const FormValidator = getApp().getForm(
      [MODULE_NAME, name.replace("_", "")].join("//")
    );
    if (FormValidator) {
      return await FormValidator.run(req, res, next);
    } else {
      return {};
    }
  };

  const afterDecorator = (req, res, next, result) => {
    const name = req.notRouteData.actionName;
    if (res.headersSent) {
      return;
    }
    if (result && objHas(result, "__redirect__")) {
      res.status(200).redirect(result.__redirect__);
    } else {
      res.status(200).json({
        status: "ok",
        message: say(`action_message_${name}_success`, {}, res.locals.locale),
        result,
      });
    }
  };

  const config = configInit.readerForModule(MODULE_NAME);
  return {
    before: beforeDecorator,
    after: afterDecorator,
    Log,
    say,
    config,
    getModel() {
      return getApp().getModel(`${MODULE_NAME}//${MODEL_NAME}`);
    },
    getModelSchema() {
      return getApp().getModelSchema(`${MODULE_NAME}//${MODEL_NAME}`);
    },
    getLogic() {
      return getApp().getLogic(`${MODULE_NAME}//${MODEL_NAME}`);
    },
    getModelUser(){
      return getApp().getModel(USER_MODEL_NAME);
    }
  };

};

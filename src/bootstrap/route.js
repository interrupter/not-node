const getApp = require("../getApp.js"),
    Form = require("../form").Form,
    HttpExceptions = require("../exceptions/http"),
    configInit = require("not-config"),
    { sayForModule } = require("not-locale"),
    { objHas, isFunc, executeFunctionAsAsync } = require("../common"),
    LogInit = require("not-log"),
    genericFormsGenerators = require("../generic/forms"),
    createDefaultFormInstance = require("../generic/form.js");

module.exports = ({
    target,
    MODULE_NAME,
    MODEL_NAME,
    USER_MODEL_NAME = "not-user//User",
    /***
     * function signature
     * (
     * prepared: any, //data output from notForm extractor
     * {
                req,                        //ExpressRequest
                Log,                        //dedicated Logger
                say,                        //precondfigured 'say'
                config,                     //precondfigured 'config' reader
                MODULE_NAME,                //context
                MODEL_NAME,                 //
                ACTION_NAME,                //
                USER_MODEL_NAME,            //
            },
     * 
     * )=>{
     *  //pass if access rights is ok
     *  //or throw an exception if rights is no good
     * }
     */
    accessRulesBuilders = {}, //per action builders, {actionName: (preapared: any, req: ExpressRequest)=>{/** pass or throw an exception **/ */}}
    accessRuleBuilder = false, //universal will be used if no dedicated action builder was found
    defaultAccessRule = false, //if builder is not found, safe by default
    createForm = createDefaultFormInstance,
    formsProps = {},
}) => {
    const Log = LogInit(target, `${MODEL_NAME}/Routes'`);
    const say = sayForModule(MODULE_NAME);
    const config = configInit.readerForModule(MODULE_NAME);

    const excuteAccessRules = async (accessRulesBuilder, params) => {
        //in case if one function
        if (isFunc(accessRulesBuilder)) {
            await executeFunctionAsAsync(accessRulesBuilder, params);
            //if this is array of functions
        } else if (Array.isArray(accessRulesBuilder)) {
            const checks = accessRulesBuilder.map((proc) => {
                return executeFunctionAsAsync(proc, params);
            });
            await Promise.all(checks);
        }
    };
    /**
     * access rights check
     */
    const checkAccessRules = async (actionName, prepared, req) => {
        const params = [
            prepared,
            {
                req,
                Log,
                say,
                config,
                MODULE_NAME,
                MODEL_NAME,
                ACTION_NAME: actionName,
                USER_MODEL_NAME,
            },
        ];
        if (accessRulesBuilders && objHas(accessRulesBuilders, actionName)) {
            const actionAccessRules = accessRulesBuilders[actionName];
            await excuteAccessRules(actionAccessRules, params);
        }
        if (accessRuleBuilder) {
            await excuteAccessRules(accessRuleBuilder, params);
        }
        if (!defaultAccessRule) {
            throw new HttpExceptions.HttpExceptionForbidden();
        }
    };

    const initGenericActionForm = ({
        app,
        MODULE_NAME,
        MODEL_NAME,
        actionName,
        formProps,
    }) => {
        if (Object.keys(genericFormsGenerators).includes(actionName)) {
            const formConstructor = genericFormsGenerators[actionName]({
                app,
                MODULE_NAME,
                MODEL_NAME,
                actionName,
                ...formProps,
            });
            return new formConstructor({
                app,
                MODULE_NAME,
                MODEL_NAME,
                actionName,
                ...formProps,
            });
        } else {
            createForm({
                app: getApp(),
                MODULE_NAME,
                MODEL_NAME,
                actionName,
                ...formProps,
            });
        }
    };

    const selectActionFormProps = (formProps, actionName) => {
        if (Object.hasOwn(formProps, actionName)) {
            return formProps[actionName];
        } else {
            return {};
        }
    };

    const getForm = (actionName) => {
        //trying inited and cached
        const fullFormPath = Form.createPath(
            MODULE_NAME,
            MODEL_NAME,
            actionName
        );
        const form = getApp().getForm(fullFormPath);
        if (form) {
            return form;
        }

        const form2 = getApp().getForm(
            Form.createPath(MODULE_NAME, undefined, actionName)
        );

        if (form2) {
            return form2;
        }
        //creating new from generics lib

        const newelyCreatedForm = initGenericActionForm({
            MODULE_NAME,
            MODEL_NAME,
            actionName,
            app: getApp(),
            formProps: selectActionFormProps(formsProps, actionName),
        });
        //caching
        getApp()
            .getModule(MODULE_NAME)
            .setForm(fullFormPath.split("//")[1], newelyCreatedForm);
        return newelyCreatedForm;
    };

    const beforeDecorator = async (req, res, next) => {
        Log?.debug(
            req.method,
            req.originalUrl,
            JSON.stringify(req.notRouteData, null, 4)
        );
        const actionName = req.notRouteData.actionName;

        const trimmedActionName = actionName.replace("_", "");
        const FormValidator = getForm(trimmedActionName);
        const prepared = FormValidator
            ? await FormValidator.run(req, res, next)
            : {};
        await checkAccessRules(trimmedActionName, prepared, req);
        return prepared;
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
                message: say(
                    `action_message_${name}_success`,
                    {},
                    res.locals.locale
                ),
                result,
            });
        }
    };

    return {
        MODULE_NAME,
        MODEL_NAME,
        before: beforeDecorator,
        after: afterDecorator,
        checkAccessRules,
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
        getModelUser() {
            return getApp().getModel(USER_MODEL_NAME);
        },
    };
};

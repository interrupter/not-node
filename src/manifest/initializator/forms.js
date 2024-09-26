const { notError } = require("not-error");
const { error } = require("not-log")(module, "initializator");

module.exports = class notModuleInitializatorForms {
    static openFile = require;

    static run({ nModule }) {
        const app = nModule.getApp();
        const moduleName = nModule.getName();
        for (let formName in nModule.getFormsConstructors()) {
            try {
                const formConstructor = nModule.getFormConstructor(formName);
                nModule.setForm(formName, new formConstructor({ app }));
                //log(`${moduleName}//${formName}`);
            } catch (e) {
                error(
                    `Error while initialization of form: ${moduleName}//${formName}`
                );
                if (e instanceof notError) {
                    error(`name: ${e.options.field}, type: ${e.options.type}`);
                } else {
                    error(e);
                }
            }
        }
    }
};

const { error } = require("not-log")(module, "initializator");
const protoModel = require("../../model/proto.js");
const { initFileSchemaFromFields } = require("../../fields");
const { notError } = require("not-error");

module.exports = class notModuleInitializatorModels {
    static openFile = require;
    constructor({ nModule }) {
        this.run({ nModule, app: nModule.getApp() });
    }

    run({ app, nModule }) {
        const moduleName = nModule.getName();
        for (let modelName in nModule.getModels()) {
            try {
                initFileSchemaFromFields({
                    app,
                    moduleName: nModule.getName(),
                    mod: nModule.getModelFile(modelName),
                    type: "model",
                    from: ":FIELDS",
                    to: ":thisSchema",
                });
                protoModel.fabricate(
                    nModule.getModelFile(modelName),
                    nModule.getOptions(),
                    nModule.mongoose
                );
                //log(`${moduleName}//${modelName}`);
            } catch (e) {
                error(
                    `Error while initialization of model: ${moduleName}//${modelName}`
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

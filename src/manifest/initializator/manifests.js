const { notError } = require("not-error");
const { error } = require("not-log")(module, "initializator");
const { initManifestFields } = require("../../fields");
const { firstLetterToUpper } = require("../../common");

const fieldsIsArray = (mod) => mod && Array.isArray(mod.fields);


const getModelName = (routeManifest)=>firstLetterToUpper(routeManifest.model);

module.exports = class notModuleInitializatorManifests {
    static openFile = require;

    static getMutationsFromManifest(nModule,routeName){
        const routeManifest = nModule.getRouteManifest(routeName);
        if(fieldsIsArray(routeManifest)){
            return [...routeManifest.fields];
        }
        return [];
    }

    static extractPrivateFields(routeManifest){
        const privateFields = [];
        if (routeManifest.privateFields) {
            privateFields.push(...(Array.isArray(routeManifest.privateFields) ? [...routeManifest.privateFields] : []));
            delete routeManifest.privateFields;
        }
        return privateFields;
    }    

    static run({ nModule }) {
        const moduleName = nModule.getName();
        for (let routeName in nModule.getRoutesManifests()) {
            try {
                const routeManifest = nModule.getRouteManifest(routeName);
                const rawMutationsList = notModuleInitializatorManifests.getMutationsFromManifest(nModule, routeName);
                const ModelName = getModelName(routeManifest);
                const rawFieldsList = nModule.getModelFields(ModelName);
                const privateFields = notModuleInitializatorManifests.extractPrivateFields(routeManifest);

                routeManifest.fields = initManifestFields(
                    nModule.getApp(),
                    rawFieldsList,
                    rawMutationsList,
                    privateFields,
                    moduleName
                );                
                
            } catch (e) {
                error(
                    `Error while initialization of route: ${moduleName}//${routeName}`
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

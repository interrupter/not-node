//file system structure
//directories
//files and information how to render them from which template and with what args with readers names

import ProjectStructure from "../../../tmpl/dirs/project.mjs";
import ApplicationStructure from "../../../tmpl/dirs/app.mjs";
import ApplicationServerStructure from "../../../tmpl/dirs/server.mjs";
import ApplicationFrontStructure from "../../../tmpl/dirs/front.mjs";
import ApplicationStaticStructure from "../../../tmpl/dirs/static.mjs";

import ApplicationModuleServerStructure from "../../../tmpl/dirs/module.server.mjs";
import ApplicationModuleServerControllersCommonStructure from "../../../tmpl/dirs/module.server.controllers.common.mjs";

import ApplicationModuleFrontStructure from "../../../tmpl/dirs/module.front.mjs";

const ProjectSubStructures = {
    app: ApplicationStructure,
    server: ApplicationServerStructure,
    front: ApplicationFrontStructure,
    static: ApplicationStaticStructure,
    "module.server": ApplicationModuleServerStructure,
    "module.server.controllers.common":
        ApplicationModuleServerControllersCommonStructure,
    "module.front": ApplicationModuleFrontStructure,
};

export {
    ProjectStructure,
    ApplicationStructure,
    ApplicationServerStructure,
    ApplicationFrontStructure,
    ApplicationStaticStructure,
    ApplicationModuleServerStructure,
    ApplicationModuleServerControllersCommonStructure,
    ApplicationModuleFrontStructure,
    ProjectSubStructures,
};

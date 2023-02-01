import Entity from "./entity.mjs";
import Env from "./env.mjs";
import ModuleFront from "./module.front.mjs";
import ModuleServer from "./module.server.mjs";
import Nginx from "./nginx.mjs";
import PM2 from "./pm2.mjs";
import Project from "./project.mjs";

const ACTIONS = {
    Entity,
    Env,
    ModuleFront,
    ModuleServer,
    Nginx,
    PM2,
    Project,
};

export default (program, options) => {
    Object.values(ACTIONS).forEach((action) => {
        action(program, options);
    });
};

import { resolve } from "node:path";
import { DEFAULT_PRIMARY_ROLES_SET } from "../const.mjs";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

class Options {
    #DEFAULT_SERVER_MODULES_SUB_PATH = "./site/app/server/modules";
    get DEFAULT_SERVER_MODULES_SUB_PATH() {
        return this.#DEFAULT_SERVER_MODULES_SUB_PATH;
    }

    #DEFAULT_FRONT_MODULES_SUB_PATH = "./site/app/front/src";
    get DEFAULT_FRONT_MODULES_SUB_PATH() {
        return this.#DEFAULT_FRONT_MODULES_SUB_PATH;
    }

    #PATH_TMPL = resolve(__dirname, "../../../tmpl/files");
    get PATH_TMPL() {
        return this.#PATH_TMPL;
    }

    #roles = DEFAULT_PRIMARY_ROLES_SET;
    get roles() {
        return this.#roles;
    }

    set roles(val) {
        if (Array.isArray(val)) {
            this.#roles = val;
        }
    }
}
export default new Options();

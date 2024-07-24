const DEFAULT_PATH_TMP = "../../tmp";
const DEFAULT_PATH_STATIC = "../static";
const DEFAULT_PATH_MODULES = "./modules";
const DEFAULT_PATH_WS = "./ws";
const DEFAULT_PATH_DB_DUMPS = "../../db.dumps";

const MANIFEST_CONSTS = require("./manifest/const");

module.exports = {
    DEFAULT_PATH_WS,
    DEFAULT_PATH_MODULES,
    DEFAULT_PATH_STATIC,
    DEFAULT_PATH_TMP,
    DEFAULT_PATH_DB_DUMPS,
    ...MANIFEST_CONSTS,
};

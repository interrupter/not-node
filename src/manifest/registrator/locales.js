const log = require("not-log")(module, "registrator");
const notLocale = require("not-locale");

module.exports = class notModuleRegistratorLocales {
    /**
     *
     * @param {object}                  input
     * @param {import('../module')}     input.nModule
     * @return {boolean}
     */
    static run({ nModule }) {
        const srcDir = notModuleRegistratorLocales.getPath(nModule);
        if (!srcDir) {
            return false;
        }
        notLocale
            .fromDir(srcDir, nModule.getName())
            .catch((e) => log && log.error(e));
        return true;
    }

    static getPath(nModule) {
        return nModule.module.paths.locales;
    }
};

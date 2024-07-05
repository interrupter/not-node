const { objHas } = require("./common");

const ENVS = {
    process: process.env.NODE_ENV || "development",
};

module.exports = class notEnv {
    /**
     * Obsolete!
     * Wrapper for 'get'
     * @static
     *  @param   {string}      key  name of var
     *  @return {object|undefined}    value or undefined
     */
    static getEnv(key) {
        console.error("Obsolete: use Env.get instead!");
        return this.get(key);
    }

    /**
     *  Returns application environment variable
     * @static
     *  @param   {string}      key  name of var
     *  @return {object|undefined}    value or undefined
     */
    static get(key) {
        if (objHas(ENVS, key)) {
            return ENVS[key];
        } else {
            return undefined;
        }
    }

    /**
     * Obsolete!
     * Wrapper for 'set'
     * @static
     *  @param   {string}      key  name of var
     *  @param   {object}      val  value
     *  @return     {notEnv}      chainable
     */
    static setEnv(key, val) {
        console.error("Obsolete: use Env.set instead!");
        return this.set(key, val);
    }

    /**
     *  Setting application environment variable
     * @static
     *  @param   {string}      key  name of var
     *  @param   {object}      val  value
     *  @return     {notEnv}      chainable
     */
    static set(key, val) {
        ENVS[key] = val;
        return notEnv;
    }
};

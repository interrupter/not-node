const {objHas} = require('./common');

const ENVS = {
  process: process.env.NODE_ENV || 'development'
};

module.exports = class notEnv {
  /**
   *  Returns application environment variable
   *  @param   {string}      key  name of var
   *  @return {object|undefined}    value or undefined
   */
  static getEnv(key) {
    if (objHas(ENVS,key)) {
      return ENVS[key];
    } else {
      return undefined;
    }
  }

  /**
   *  Setting application environment variable
   *  @param   {string}      key  name of var
   *  @param   {object}      val  value
   *  @return {notDomain}      chainable
   */
  static setEnv(key, val) {
    ENVS[key] = val;
    return notEnv;
  }
};

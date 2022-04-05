const fs = require('fs');
const path = require('path');
const notPath = require('not-path');

/** @module Common */
/**
 * Change first letter case to lower
 * @param  {string} string input string
 * @return {string}        result
 */

module.exports.firstLetterToLower = function(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
};

/**
 * Change first letter case to higher
 * @param  {string} string input string
 * @return {string}        result
 */

module.exports.firstLetterToUpper = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 *  Validates if string is a ObjectId
 *  @param  {string}  id   ObjectId string to validate
 *  @return {booelean}  true if check is not failed
 */
module.exports.validateObjectId = (id) => {
  try {
    return id.match(/^[0-9a-fA-F]{24}$/) ? true : false;
  } catch (e) {
    return false;
  }
};

/**
 *  Validates and compares ObjectIds in string or Object form
 *  @param  {string|ObjectId}  firstId   first id
 *  @param  {string|ObjectId}  secondId   second id
 *  @return {booelean}        true if equal
 */
module.exports.compareObjectIds = (firstId, secondId) => {
  try {
    let a = firstId,
      b = secondId;
    if (typeof firstId !== 'string') {
      a = a.toString();
    }
    if (typeof secondId !== 'string') {
      b = b.toString();
    }
    if (
      !module.exports.validateObjectId(a) ||
      !module.exports.validateObjectId(b)
    ) {
      return false;
    }
    return a === b;
  } catch (e) {
    return false;
  }
};

/**
 *  Returns today Date object without hours, minutes, seconds
 *  @return {number}  current date with 00:00:00 in ms of unix time
 */
module.exports.getTodayDate = () => {
  let t = new Date();
  return (new Date(t.getFullYear(), t.getMonth(), t.getDate())).getTime();
};


/**
 *  Returns true if object has field of name
 *   @param   {object}    obj    some object
 *  @param  {string}    name  field name
 *  @return {boolean}          if object contains field with name
 **/
const objHas = (obj, name) => {
  if(typeof obj === 'undefined') return false;
  if(obj === null) return false;
  return Object.prototype.hasOwnProperty.call(obj, name);
};
module.exports.objHas = objHas;


/**
 * Copies object to secure it from changes
 * @param {object}   obj     original object
 * @return {object}          copy of object
 **/
module.exports.copyObj = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Copies object to secure it from changes
 * @param {object}   obj     original object
 * @return {object}          copy of object
 **/
module.exports.partCopyObj = (obj, list) => {
  let partObj = Object.keys(obj).reduce((prev, curr) => {
    if (list.includes(curr)) {
      prev[curr] = obj[curr];
    }
    return prev;
  }, {});
  return JSON.parse(JSON.stringify(partObj));
};


/**
 * Test argument type to be 'function'
 * @param {any}  func    possible function
 * @return {boolean}     if this is a function
 **/
const isFunc = module.exports.isFunc = (func) => {
  return typeof func === 'function';
};

/**
 * Returns true if argument is Async function
 * @param {function} func  to test
 * @return {boolean}       if this function is constructed as AsyncFunction
 **/
const isAsync = module.exports.isAsync = (func) => {
  return func.constructor.name === 'AsyncFunction';
};


/**
 *  Executes method of object in appropriate way inside Promise
 * @param {object}   obj     original object
 * @param {string}   name    method name to execute
 * @param {Array}     params  array of params
 * @return {Promise}          results of method execution
 **/
module.exports.executeObjectFunction = async (obj, name, params) => {
  if (obj) {
    const proc = notPath.get(':' + name, obj);
    if (isFunc(proc)) {
      if (isAsync(proc)) {
        return await proc(...params);
      } else {
        return proc(...params);
      }
    }
  }
};


/**
 *  Executes method of object in apropriate way inside Promise
 * @param {Object}   from     original object
 * @param {Object}   name    method name to execute
 * @param {Array}     list  array of params
 * @return {Promise}          results of method execution
 **/
module.exports.mapBind = (from, to, list) => {
  list.forEach((item) => {
    if (typeof from[item] === 'function') {
      to[item] = from[item].bind(from);
    }
  });
};


/**
 *  Synchronously check file existence and if it's really a file
 * @param {string}     filePath  full path to file
 * @return {boolean}            true if path exists and it's a file
 **/
module.exports.tryFile = (filePath) => {
  try {
    const stat = fs.lstatSync(filePath);
    return stat && stat.isFile();
  } catch (e) {
    return false;
  }
};

/**
 * Generates paths object for module/index.js files based on content and relative
 * path
 * @param {Array<string>}  content  list of module components ['models', 'logics', 'routes',...]
 * @param {string}         relative  path to parent folder of components
 * @param {Object}         paths object for module/index.js
 **/
module.exports.generatePaths = (content = [], relative = 'src') => {
  const toPath = (name) => path.join(relative, name);
  return content.reduce((prev, cur) => {
    prev[cur] = toPath(cur);
    return prev;
  }, {});
};

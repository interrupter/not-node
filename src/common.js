const fs = require("fs");
const path = require("path");
const notPath = require("not-path");

/** @module Common */
/**
 * Change first letter case to lower
 * @param  {string} string input string
 * @return {string}        result
 */

module.exports.firstLetterToLower = function (string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
};

/**
 * Change first letter case to higher
 * @param  {string} string input string
 * @return {string}        result
 */

module.exports.firstLetterToUpper = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 *  Validates if string is a ObjectId
 *  @param  {string|import('mongoose').Schema.Types.ObjectId}  id   ObjectId string to validate
 *  @return {boolean}  true if check is not failed
 */
module.exports.validateObjectId = (id) => {
    try {
        return id.toString().match(/^[0-9a-fA-F]{24}$/) ? true : false;
    } catch (e) {
        return false;
    }
};

/**
 *  Validates and compares ObjectIds in string or Object form
 *  @param  {string|import('mongoose').Schema.Types.ObjectId}  firstId   first id
 *  @param  {string|import('mongoose').Schema.Types.ObjectId}  secondId   second id
 *  @return {boolean}        true if equal
 */
module.exports.compareObjectIds = (firstId, secondId) => {
    try {
        let a = firstId,
            b = secondId;
        if (typeof firstId !== "string") {
            a = a.toString();
        }
        if (typeof secondId !== "string") {
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
    return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
};

/**
 *  Returns true if object has field of name
 *   @param   {object}    obj    some object
 *  @param  {string|Array<string>}    name  field name
 *  @return {boolean}          if object contains field with name
 **/
const objHas = (obj, name) => {
    if (typeof obj === "undefined") return false;
    if (obj === null) return false;
    if (Array.isArray(name)) {
        return name.every((itm) => typeof itm === "string" && objHas(obj, itm));
    } else {
        return Object.prototype.hasOwnProperty.call(obj, name);
    }
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
const isFunc = (module.exports.isFunc = (func) => {
    return typeof func === "function";
});

/**
 * Returns true if argument is Async function
 * @param {function} func  to test
 * @return {boolean}       if this function is constructed as AsyncFunction
 **/
const isAsync = (module.exports.isAsync = (func) => {
    return func.constructor.name === "AsyncFunction";
});

/**
 *  Executes method in appropriate way inside Promise
 * @param {function}   proc    function to execute
 * @param {Array}     params  array of params
 * @return {Promise}          results of method execution
 **/
const executeFunctionAsAsync = async (proc, params) => {
    if (isFunc(proc)) {
        if (isAsync(proc)) {
            return await proc(...params);
        } else {
            return proc(...params);
        }
    }
    //throw new Error("Could not execute `proc` is not a function");
};

module.exports.executeFunctionAsAsync = executeFunctionAsAsync;

/**
 *  Executes method of object in appropriate way inside Promise
 * @param {object}   obj     original object
 * @param {string}   name    method name to execute
 * @param {Array}     params  array of params
 * @return {Promise}          results of method execution
 **/
module.exports.executeObjectFunction = async (obj, name, params) => {
    if (!obj) {
        return;
    }
    if (name.indexOf(".") > -1) {
        const proc =
            typeof obj == "object"
                ? notPath.get(":" + name, obj, {})
                : obj[name];
        if (!proc) {
            return;
        }
        return await executeFunctionAsAsync(proc.bind(obj), params);
    } else {
        if (obj[name] && isFunc(obj[name])) {
            if (isAsync(obj[name])) {
                return await obj[name](...params);
            } else {
                return obj[name](...params);
            }
        }
    }
};

/**
 *  Executes method of object in apropriate way inside Promise
 * @param {Object}   from     original object
 * @param {Object}   to    method name to execute
 * @param {Array}    list  array of params
 **/
module.exports.mapBind = (from, to, list) => {
    list.forEach((item) => {
        if (typeof from[item] === "function") {
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
 *  Asynchronously check file existence and if it's really a file
 * @param {string}     filePath  full path to file
 * @return {Promise<boolean>}            true if path exists and it's a file
 **/
module.exports.tryFileAsync = async (filePath) => {
    try {
        const stat = await fs.promises.lstat(filePath);
        return stat && stat.isFile();
    } catch (e) {
        return false;
    }
};

/**
 *  Trying to parse input to JSON or returns def
 * @param {string}     input  string to be parsed
 * @param {any}     def  what to return if parse failed, default undefined
 * @return {Object}            JSON
 **/
module.exports.tryParse = (input, def = undefined) => {
    try {
        return JSON.parse(input);
    } catch (e) {
        return def;
    }
};

/**
 *  Trying to asynchronously parse input to JSON or returns def
 * @param {string}     input  string to be parsed
 * @param {any}     def  what to return if parse failed, default undefined
 * @return {Promise<Object>}            JSON
 **/
module.exports.tryParseAsync = (
    input,
    def = undefined,
    throwOnException = false
) => {
    return new Promise((resolve, reject) => {
        try {
            resolve(JSON.parse(input));
        } catch (e) {
            if (throwOnException && !def) {
                reject(e);
            } else {
                resolve(def);
            }
        }
    });
};

/**
 * Generates paths object for module/index.js files based on content and relative
 * path
 * @param {Array<string>}  content  list of module components ['models', 'logics', 'routes',...]
 * @param {string}         relative  path to parent folder of components
 * @returns {Object}         paths object for module/index.js
 **/
module.exports.generatePaths = (content = [], relative = "src") => {
    const toPath = (name) => path.join(relative, name);
    return content.reduce((prev, cur) => {
        prev[cur] = toPath(cur);
        return prev;
    }, {});
};

/**
 *  Get request ip
 *  @param  {object}  req   Express Request
 **/
module.exports.getIP = (req) => {
    if (req) {
        return (
            (req.headers && req.headers["x-forwarded-for"]) ||
            (req.connection && req.connection.remoteAddress) ||
            (req.socket && req.socket.remoteAddress) ||
            (req.connection &&
                req.connection.socket &&
                req.connection.socket.remoteAddress)
        );
    } else {
        return undefined;
    }
};

/**
 *
 *
 * @param {string} prefix
 * @return {function}
 */
const createIsStringPrefixedTester = (prefix) => {
    if (!prefix || prefix.length === 0) throw Error("No prefix provided");
    return (str) => {
        return str && str.length > prefix.length && str.indexOf(prefix) === 0
            ? prefix.length
            : 0;
    };
};
module.exports.createIsStringPrefixedTester = createIsStringPrefixedTester;

/**
 *
 *
 * @param {string} val
 * @param {Object} options
 * @return {number} prefix length
 */
const stringIsPrefixed = (val, options) => {
    if (typeof val === "string" && options) {
        if (options.tester && typeof options.tester === "function") {
            return options.tester(val);
        }
        if (
            options.prefix &&
            typeof options.prefix === "string" &&
            options.prefix.length > 0
        ) {
            return createIsStringPrefixedTester(options.prefix)(val);
        }
    }
    return 0;
};
module.exports.stringIsPrefixed = stringIsPrefixed;

/**
 * It will get value of name from object property and then test,
 * if value corresponds to a property process.ENV object. If it does -
 * value from process.ENV.* will be returned, if not - just value of source[name]
 * @param {object}      source          source object
 * @param {string}      name            option name
 * @param {object}      [options]         options
 * @param {function}    [options.tester]  (str)=>integer, checks value of source[name], if returns not 0 than value is name of property in process.ENV to be returned, if number more than 0 returned and drop is set to true, returned number of chars will be droped
 * @param {string}      [options.prefix = 'ENV$']  prefix that indicates that source[name] value corresponds to process.ENV property
 * @param {boolean}     [options.drop = true]  should we drop prefix from value before reach for real value in process.ENV, ENV$VALUE - process.ENV.VALUE
 * @returns  {*}    any
 */
const getValueFromEnv = (
    source,
    name,
    options = { prefix: "ENV$", drop: true }
) => {
    if (source && objHas(source, name)) {
        const val = source[name];
        const len = stringIsPrefixed(val, options);
        if (len > 0) {
            const envName = options.drop ? val.slice(len) : val;
            if (typeof process.env[envName] !== "undefined") {
                return process.env[envName];
            }
        }
        return val;
    }
};
module.exports.getValueFromEnv = getValueFromEnv;

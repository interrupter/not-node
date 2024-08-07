/** @module Model/Validator */
const validate = require("mongoose-validator");
const { objHas, executeObjectFunction, isFunc, isAsync } = require("../common");
const notEnv = require("../env");

function extractValidationEnvGetter(options) {
    if (
        options &&
        objHas(options, "validationEnv") &&
        isFunc(options.validationEnv)
    ) {
        return options.validationEnv;
    } else {
        const globalValidationEnvGetter = notEnv.get("validationEnv");
        if (globalValidationEnvGetter && isFunc(globalValidationEnvGetter)) {
            return globalValidationEnvGetter;
        } else {
            //should return at least empty object
            return () => {
                return { validate };
            };
        }
    }
}

function extendObsolete(rule) {
    const result = { ...rule };
    if (objHas(result, "arguments") && !Array.isArray(result.arguments)) {
        result.arguments = Object.values(result.arguments);
    }
    return validate(result);
}

function extendModern(rule, options) {
    const result = { ...rule };
    delete result.validator;
    const validationEnv = extractValidationEnvGetter(options)();
    if (isAsync(rule.validator)) {
        result.validator = async (val) => {
            return await executeObjectFunction(rule, "validator", [
                val,
                validationEnv,
            ]);
        };
    } else {
        result.validator = (val) => {
            return executeObjectFunction(rule, "validator", [
                val,
                validationEnv,
            ]);
        };
    }
    return result;
}

function extendValidation(rule, options) {
    if (typeof rule.validator === "string") {
        //will extend from text description to validatejs lib validation function
        return extendObsolete(rule);
    } else {
        //more complex validation
        return extendModern(rule, options);
    }
}

/**
 *  Take array of validator (https://www.npmjs.com/package/validator) rules
 *  and create array of mongoose-validator (https://www.npmjs.com/package/mongoose-validator) rules
 *  then return it
 **/

module.exports = function (validators, options) {
    let result = null;
    result = validators.map((rule) => extendValidation(rule, options));
    return result;
};

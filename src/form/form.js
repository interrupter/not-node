const Schema = require("mongoose").Schema;
const validator = require("validator");
const notPath = require("not-path");
const FormFabric = require("./fabric");
const Auth = require("../auth");
const { createSchemaFromFields } = require("../fields");
const notFieldsFilter = require("../fields/filter.js");
const getApp = require("../getApp.js");
const {
    objHas,
    isFunc,
    firstLetterToUpper,
    firstLetterToLower,
    copyObj,
} = require("../common");

const ValidationBuilder = require("not-validation").Builder;
const ValidationSession = require("not-validation").Session;

const notValidationError = require("not-error/src/validation.error.node.cjs");
const InitRateLimiter = require("../init/lib/rateLimiter");

const notError = require("not-error/src/error.node.cjs");
const { FormExceptionTooManyRequests } = require("../exceptions/form.js");

const {
    FormExceptionExtractorForFieldIsUndefined,
    FormExceptionTransformerForFieldIsUndefined,
} = require("../exceptions/form.js");

const DEFAULT_EXTRACTORS = require("./extractors");
const DEFAULT_ID_EXTRACTORS = require("./env_extractors");
const DEFAULT_TRANSFORMERS = require("./transformers");
const DEFAULT_AFTER_EXTRACT_TRANSFORMERS = [];
const notAppIdentity = require("../identity/index.js");
const { ACTION_DATA_TYPES } = require("../const.js");

/**
 * Generic form validation class
 * @class Form
 */
class Form {
    /**
     * @prop {import('not-validation/src/builder').notValidationSchema} validation schema
     **/
    #SCHEMA = {
        fields: {},
        form: [],
        forms: {},
    };
    //#MODEL_SCHEMA;
    /**
     * @prop {string} name of form
     **/
    #FORM_NAME;

    #MODEL_NAME;
    #MODULE_NAME;
    #PROTO_FIELDS;

    #EXTRACTORS = {
        ...DEFAULT_EXTRACTORS,
    };

    #ENV_EXTRACTORS = {
        ...DEFAULT_ID_EXTRACTORS,
    };

    #TRANSFORMERS = {
        ...DEFAULT_TRANSFORMERS,
    };

    #AFTER_EXTRACT_TRANSFORMERS = {
        ...DEFAULT_AFTER_EXTRACT_TRANSFORMERS,
    };

    #INSTRUCTIONS = null;

    #rateLimiter = null;
    #rateLimiterIdGetter = (data) => data.identity.sid;
    #rateLimiterException = FormExceptionTooManyRequests;
    #rateLimiterClientName = InitRateLimiter.DEFAULT_CLIENT;

    /**
     *
     * @param {Object} options
     * @param {Array<string|Array<string>>} options.FIELDS
     * @param {string} options.FORM_NAME
     * @param {string} options.MODEL_NAME
     * @param {string} options.MODULE_NAME
     * @param {string} options.actionName
     * @param {import('../app.js')} options.app
     * @param {Object.<string, Function>} options.EXTRACTORS
     * @param {Object.<string, Function>} options.TRANSFORMERS
     * @param {import('../types.js').notAppFormProcessingPipe|null} options.INSTRUCTIONS
     * @param {Array<Function>} options.AFTER_EXTRACT_TRANSFORMERS
     * @param {Object.<string, import('../types.js').notAppFormEnvExtractor>} options.ENV_EXTRACTORS
     * @param   {import('../types.js').notAppFormRateLimiterOptions}    options.rate
     */
    constructor({
        FIELDS = [],
        FORM_NAME,
        MODEL_NAME,
        MODULE_NAME,
        actionName,
        app,
        EXTRACTORS = {},
        ENV_EXTRACTORS = {},
        TRANSFORMERS = {},
        INSTRUCTIONS = null,
        AFTER_EXTRACT_TRANSFORMERS = [],
        rate,
    }) {
        this.#FORM_NAME =
            FORM_NAME ?? Form.createName(MODULE_NAME, MODEL_NAME, actionName);
        this.#MODEL_NAME = MODEL_NAME;
        this.#MODULE_NAME = MODULE_NAME;
        this.#setFields(app, FIELDS);

        this.#createValidationSchema(app);
        this.#augmentValidationSchema();
        this.#addInstructions(INSTRUCTIONS);
        this.#addExtractors(EXTRACTORS);
        this.#addEnvExtractors(ENV_EXTRACTORS);
        this.#addTransformers(TRANSFORMERS);
        this.#addAfterExtractTransformers(AFTER_EXTRACT_TRANSFORMERS);
        this.#createRateLimiter(rate);
    }

    #setFields(app, FIELDS = []) {
        try {
            const warning = () =>
                app.logger.warn(`No PROTO_FIELDS for ${this.#FORM_NAME} form`);
            if (FIELDS && Array.isArray(FIELDS) && FIELDS.length) {
                this.#PROTO_FIELDS = FIELDS;
            } else if (this.#MODEL_NAME) {
                let modelPath = `${this.#MODEL_NAME}`;
                if (this.#MODULE_NAME) {
                    modelPath = `${this.#MODULE_NAME}//${this.#MODEL_NAME}`;
                }
                //no path to model - returning after warning
                if (!modelPath) {
                    warning();
                    return;
                }
                const mod = app.getModelFile(modelPath);
                //no module or fields in module exports - returning after warning
                if (
                    !(
                        mod &&
                        mod.FIELDS &&
                        Array.isArray(mod.FIELDS) &&
                        mod.FIELDS.length
                    )
                ) {
                    warning();
                    return;
                }
                this.#PROTO_FIELDS = copyObj(mod.FIELDS);
            }
        } catch (e) {
            app.logger.error(e);
        }
    }

    get FORM_NAME() {
        return this.#FORM_NAME;
    }

    /**
     * Creates model name string used in logging
     * @param {string} MODULE_NAME
     * @param {string|undefined} MODEL_NAME
     * @param {string} actionName = 'data'
     * @returns {string}
     */
    static createName(MODULE_NAME, MODEL_NAME, actionName = "data") {
        if (MODEL_NAME) {
            return `${MODULE_NAME}:${MODEL_NAME}:${firstLetterToUpper(
                actionName
            )}Form`;
        } else {
            return `${MODULE_NAME}:Common:${firstLetterToUpper(
                actionName
            )}Form`;
        }
    }

    /**
     * Create path to form in notDomain resources manager. Could be used to find form via notApplication.getForm(formPath)
     * @param {string} MODULE_NAME
     * @param {string|undefined} MODEL_NAME
     * @param {string} actionName
     * @returns {string}
     */
    static createPath(MODULE_NAME, MODEL_NAME, actionName) {
        if (MODEL_NAME) {
            return `${MODULE_NAME}//${firstLetterToLower(
                MODEL_NAME
            )}.${actionName}`;
        } else {
            return `${MODULE_NAME}//${actionName}`;
        }
    }

    getExtractorsOptions() {
        return {};
    }

    /**
     *
     *
     * @param {import('../types').notNodeExpressRequest} req
     * @return {string|undefined}
     * @memberof Form
     */
    getModelName(req) {
        if (this.#MODEL_NAME) {
            return this.#MODEL_NAME;
        } else if (req && req.notRouteData) {
            return firstLetterToUpper(req.notRouteData.modelName);
        }
        return undefined;
    }

    /**
     *  Returns array of types of data in action. Is subset of values of ACTION_DATA_TYPES object.
     *
     * @param {import('../types').notNodeExpressRequest} req
     * @return {Array<string>}
     * @memberof Form
     */
    getActionDataDataTypes(req) {
        if (
            req &&
            req.notRouteData &&
            req.notRouteData.actionData &&
            req.notRouteData.actionData.data &&
            Array.isArray(req.notRouteData.actionData.data)
        ) {
            return req.notRouteData.actionData.data;
        }
        return [];
    }

    /**
     *
     *
     * @return {string}
     * @memberof Form
     */
    getModuleName() {
        return this.#MODULE_NAME;
    }

    /**
     * Extract data from ExpressRequest object and validates it
     * returns it or throws
     * @param   {import('../types').notNodeExpressRequest}   req expressjs request object
     * @return  {Promise<Object>} form data
     * @throws  {notValidationError}
     **/
    async run(req) {
        let data = await this.extract(req);
        data = await this.afterExtract(data, req);
        await this.#checkRate(data);
        await this.#_validate(data);
        return data;
    }

    /**
     * Extracts data, may be be overriden
     * @param {import('../types').notNodeExpressRequest} req expressjs request object
     * @return {Promise<import('../types').PreparedData>}        forma data
     **/
    async extract(req) {
        /** @type {import('../types').PreparedData} */
        let result = {
            ...this.extractRequestEnvs(req),
        };
        if (this.getActionDataDataTypes(req).includes(ACTION_DATA_TYPES.DATA)) {
            result.data = this.#extractByBestInstructions(req);
        } else if (this.getActionDataDataTypes(req).includes("record")) {
            getApp().warn(
                'actionData.data = record is obsolete, use data instead aka data:["data"]'
            );
            result.data = this.#extractByBestInstructions(req);
        }
        return result;
    }

    #extractByBestInstructions(req) {
        if (this.#INSTRUCTIONS) {
            return this.extractByInstructions(req, this.#INSTRUCTIONS);
        } else {
            return this.extractByInstructionsFromRouteActionFields(req);
        }
    }

    /**
     * Chance to edit prepared data
     *
     * @param {import('../types').PreparedData}             value
     * @param {import('../types').notNodeExpressRequest}    [req]
     * @return {Promise<import('../types').PreparedData>}
     */
    async afterExtract(value, req) {
        if (this.#AFTER_EXTRACT_TRANSFORMERS) {
            this.#AFTER_EXTRACT_TRANSFORMERS.forEach((aeTransformer) => {
                aeTransformer(value, req);
            });
        }
        return value;
    }

    #addEnvExtractors(extractors = {}) {
        if (extractors) {
            this.#ENV_EXTRACTORS = { ...this.#ENV_EXTRACTORS, ...extractors };
        }
    }

    extractRequestEnvs(req) {
        const result = {};
        Object.values(this.#ENV_EXTRACTORS).forEach((extractor) => {
            const extracted = extractor(this, req);
            if (
                extracted &&
                typeof extracted.value !== "undefined" &&
                extracted.name
            ) {
                result[extracted.name] = extracted.value;
            }
        });
        return result;
    }

    /**
     * Runs all validation rules against data
     * Collects all errors to an object
     * if validation failes - returns error object with detail per field description
     * of errors
     * @param {object} data input data for validation
     * @returns {Promise<undefined>} resolves or throwing notValidationError or notError if reason is unknown
     **/
    async validate(data) {
        try {
            const validationResult = await ValidationSession(
                this.#SCHEMA,
                data
            );
            if (!validationResult.clean) {
                throw new notValidationError(
                    "not-node:form_validation_error",
                    validationResult.getReport(),
                    null,
                    data
                );
            }
        } catch (e) {
            if (e instanceof notValidationError) {
                throw e;
            } else {
                throw new notError(
                    "not-node:form_validation_unknown_error",
                    {
                        FORM_NAME: this.#FORM_NAME,
                        PROTO_FIELDS: this.#PROTO_FIELDS,
                        FORM_FIELDS: this.getFields(),
                        message: e.message,
                    },
                    e
                );
            }
        }
    }

    //should be overriden
    /**
     * Returns form specified rules of validation
     **/
    getFormValidationRules() {
        return [];
    }

    /**
     * Returns function that works as a getter for additional environment variables for
     * validators.
     * validationFunction(value, additionalEnvVars = {}){}
     **/
    getValidatorEnvGetter() {
        return () => {
            //should be sync function
            return {
                validator,
                env: true, //some env variables for validators
            };
        };
    }

    /**
     * Sets validation rules for field
     * @param {string} fieldName field name
     * @param {Array<Object>} validators  validation objects {validator: string|function, message: string}
     **/
    setValidatorsForField(fieldName, validators) {
        this.#SCHEMA.fields[fieldName] = validators;
    }

    /**
     * Returns array of validators
     * @return {Array<Object>}
     **/
    getValidatorsForField(fieldName) {
        return this.#SCHEMA.fields[fieldName];
    }

    /**
     * Returns list of field names
     * @return {Array<string>}
     **/
    getFields() {
        return Object.keys(this.#SCHEMA.fields);
    }

    #createValidationSchema(app) {
        //creating full model schema
        const modelSchema = this.#createModelSchema(app);
        //extract fields validation rules
        this.#extractValidationSchemaFromModelSchema(modelSchema);
        //now form fields and form validation rules is formed in raw form
    }

    #createModelSchema(app) {
        return createSchemaFromFields(
            app,
            this.#PROTO_FIELDS,
            "model",
            this.#FORM_NAME
        );
    }

    #extractValidationSchemaFromModelSchema(modelSchema) {
        for (let t in modelSchema) {
            if (objHas(modelSchema[t], "validate")) {
                this.setValidatorsForField(t, modelSchema[t].validate);
            }
        }
        this.#SCHEMA.form = this.getFormValidationRules();
    }

    #augmentValidationSchema() {
        this.#SCHEMA = ValidationBuilder(
            this.#SCHEMA,
            this.getValidatorEnvGetter()
        );
    }

    /**
     * Validates form data or throws
     * @param {Object} data    form data
     * @return {Promise<Object>}
     * @throws {notValidationError}
     **/
    async #_validate(data) {
        try {
            await this.validate(data);
        } catch (e) {
            if (e instanceof notError || e instanceof notValidationError) {
                throw e;
            } else {
                throw new notError(
                    "not-node:form_validation_error",
                    {
                        FORM_NAME: this.#FORM_NAME,
                        PROTO_FIELDS: this.#PROTO_FIELDS,
                        FORM_FIELDS: this.getFields(),
                        data,
                        message: e.message,
                    },
                    e
                );
            }
        }
    }

    static fabric() {
        return FormFabric;
    }
    /**
     *  Object with named extractor functions
     * @param {import('../types.js').notAppFormProcessingPipe|null} instructions
     */
    #addInstructions(instructions = null) {
        if (instructions) {
            this.#INSTRUCTIONS = { ...instructions };
        }
    }

    /**
     *  Object with named extractor functions
     * @param {Object.<string,function>} extractors
     */
    #addExtractors(extractors = {}) {
        if (extractors) {
            this.#EXTRACTORS = { ...this.#EXTRACTORS, ...extractors };
        }
    }

    /**
     * Extracts from express Request object data by inststructions object
     * @param {import('../types').notNodeExpressRequest} req
     * @param {import('../types.js').notAppFormProcessingPipe} instructions {fieldName: [extractor, ...transformers]}   extractors and transformers should be string (names of functions from libs) or functions
     * @returns {Object}
     */
    extractByInstructions(req, instructions) {
        const results = {};
        for (let fieldName in instructions) {
            const instruction = instructions[fieldName];
            if (Array.isArray(instruction)) {
                this.#extractByInstructionPipe(
                    results,
                    instruction,
                    fieldName,
                    req
                );
            } else {
                this.#extractByInstruction(
                    results,
                    instruction,
                    fieldName,
                    req
                );
            }
        }
        return results;
    }

    /**
     *  Runs one extractor provided as name of extractor from library or as a function.
     *  Add extracted data to results object.
     * @param {Object} results
     * @param {import('../types.js').notAppFormPropertyProcessingPipeInstruction} instruction
     * @param {string} fieldName    field name, maybe path to sub-object aka data.id
     * @param {import('../types.js').notNodeExpressRequest} req
     * @throws {FormExceptionExtractorForFieldIsUndefined}
     */
    #extractByInstruction(results, instruction, fieldName, req) {
        if (isFunc(instruction)) {
            //using notPath to be able use paths to sub-objects for properties as data.targetId, data.list[0].value etc
            notPath.set(
                notPath.PATH_START_OBJECT + fieldName,
                results,
                // @ts-ignore
                instruction(req, fieldName)
            );
        } else if (typeof instruction == "string") {
            const extractor = this.#EXTRACTORS[instruction];
            if (isFunc(extractor)) {
                notPath.set(
                    notPath.PATH_START_OBJECT + fieldName,
                    results,
                    extractor(req, fieldName)
                );
            } else {
                throw new FormExceptionExtractorForFieldIsUndefined(fieldName);
            }
        }
    }

    /**
     *
     * @param {Object}       results    resulting object
     * @param {import('../types.js').notAppFormPropertyProcessingPipe}       instructions
     * @param {string}  fieldName   field name, maybe path to sub-object aka data.id
     * @param {import('../types.js').notNodeExpressRequest} req
     */
    #extractByInstructionPipe(results, instructions, fieldName, req) {
        if (!instructions || instructions.length === 0) {
            throw new FormExceptionExtractorForFieldIsUndefined(fieldName);
        }
        //
        this.#extractByInstruction(results, instructions[0], fieldName, req);
        for (let t = 1; t < instructions.length; t++) {
            const instruction = instructions[t];
            this.#transformByInstruction(results, instruction, fieldName);
        }
    }

    /**
     *
     * @param {Object} results      resulting object
     * @param {import('../types.js').notAppFormPropertyProcessingPipeInstruction} instruction
     * @param {string} fieldName    field name, maybe path to sub-object aka data.id
     * @throws  {FormExceptionTransformerForFieldIsUndefined}
     */
    #transformByInstruction(results, instruction, fieldName) {
        if (isFunc(instruction)) {
            notPath.set(
                notPath.PATH_START_OBJECT + fieldName,
                results,
                // @ts-ignore
                instruction(results[fieldName])
            );
        } else if (typeof instruction == "string") {
            const transformer = this.#TRANSFORMERS[instruction];
            if (isFunc(transformer)) {
                notPath.set(
                    notPath.PATH_START_OBJECT + fieldName,
                    results,
                    transformer(results[fieldName])
                );
            } else {
                throw new FormExceptionTransformerForFieldIsUndefined(
                    fieldName,
                    instruction
                );
            }
        }
    }

    /**
     *
     * @param {import('../types').notNodeExpressRequest}   req     Express Request
     * @returns {Array<string>}
     */
    extractActionFieldsFromRequest(req) {
        if (
            req?.notRouteData?.actionData?.fields &&
            Array.isArray(req.notRouteData.actionData.fields)
        ) {
            return req.notRouteData.actionData.fields.flat(2);
        }
        if (
            req?.notRouteData?.rule?.fields &&
            Array.isArray(req.notRouteData.rule.fields)
        ) {
            return req.notRouteData.rule.fields.flat(2);
        }
        return [];
    }

    /**
     *
     * @param {import('../types.js').notActionData} actionData
     * @returns
     */
    getActionSignature(actionData) {
        if (actionData.actionSignature) {
            return actionData.actionSignature;
        } else if (actionData.method && typeof actionData.method === "string") {
            const METHOD = actionData.method.toUpperCase();
            if (objHas(Auth.METHOD_SIGNAURES, METHOD)) {
                return Auth.METHOD_SIGNAURES[METHOD];
            }
        }
        return Auth.ACTION_SIGNATURES.ANY;
    }

    /**
     *
     * @param {import('../types.js').notNodeExpressRequest} req
     * @returns {import('../fields/filter.js').FieldsFilteringModificators}
     */
    extractActionMods(req) {
        const authData = notAppIdentity.extractAuthData(req);
        /**
         * @type {import('../types.js').notRouteData}
         */
        const routeData = req.notRouteData;
        let action = this.getActionSignature(req.notRouteData.actionData);
        if (
            action === Auth.ACTION_SIGNATURES.ANY &&
            routeData.actionName &&
            routeData.actionName.length
        ) {
            action = routeData.actionName;
        }
        return {
            auth: authData.auth,
            roles: authData.role,
            root: authData.root,
            modelName: routeData.modelName,
            action,
        };
    }

    /**
     *
     * @param {Object} schemaField
     */
    extractDefaultTransformers(schemaField) {
        if (typeof schemaField === "undefined" || schemaField === null) {
            return [];
        }
        if (
            schemaField.transformers &&
            Array.isArray(schemaField.transformers)
        ) {
            return schemaField.transformers;
        }
        switch (schemaField.type) {
            case String:
            case Schema.Types.String:
                return ["xss"];
            default:
                return [];
        }
    }

    /**
     *
     * @param {import('../types.js').notNodeExpressRequest} req
     * @param {import('../types.js').notAppFormPropertyProcessingPipe} mainInstruction
     * @param {import('../types.js').notAppFormProcessingPipe} exceptions
     * @returns {import('../types.js').notAppFormProcessingPipe}
     */
    createInstructionFromRouteActionFields(
        req,
        mainInstruction = ["fromBody"],
        exceptions = {}
    ) {
        const result = {};
        const fields = this.extractActionFieldsFromRequest(req);
        const schema = getApp().getModelSchema(
            `${this.getModuleName()}//${this.getModelName(req)}`
        );
        const filteredFields = notFieldsFilter.filter(
            fields,
            schema,
            this.extractActionMods(req)
        );
        filteredFields.forEach((fieldName) => {
            if (objHas(exceptions, fieldName)) {
                result[fieldName] = exceptions[fieldName];
            } else {
                const fieldTransformers = this.extractDefaultTransformers(
                    schema[fieldName]
                );
                if (Array.isArray(fieldTransformers)) {
                    result[fieldName] = [
                        ...mainInstruction,
                        ...fieldTransformers,
                    ];
                } else {
                    result[fieldName] = [...mainInstruction];
                }
            }
        });
        // @ts-ignore
        return result;
    }

    /**
     *  Creates object {[fieldName]: Array[extractor:string|function, ...transformers:Array<string|function>]}
     * @param {import('../types.js').notNodeExpressRequest}   req       express request with notRouteData property
     * @param {import('../types.js').notAppFormPropertyProcessingPipe}               mainInstruction             what is a common pipe to apply to an property [extractor, ...transformers]
     * @param {import('../types.js').notAppFormProcessingPipe}                      exceptions                  what shouldn't be treated as common and have own pipes {fieldName:string: [extractor, ...transformers]}
     * @param {import('../types.js').notAppFormProcessingPipe}                      additional
     * @returns {object}
     */
    extractByInstructionsFromRouteActionFields(
        req,
        mainInstruction = ["fromBody"],
        exceptions = {},
        additional = {}
    ) {
        const instructions = {
            ...this.createInstructionFromRouteActionFields(
                req,
                mainInstruction,
                exceptions
            ),
            ...additional,
        };
        return this.extractByInstructions(req, instructions);
    }

    /**
     * Value transformers
     * @param   {object}    transformers
     */
    #addTransformers(transformers = {}) {
        if (transformers) {
            this.#TRANSFORMERS = { ...this.#TRANSFORMERS, ...transformers };
        }
    }

    #addAfterExtractTransformers(transformers = []) {
        if (transformers && Array.isArray(transformers)) {
            this.#AFTER_EXTRACT_TRANSFORMERS = [...transformers];
        }
    }

    #createRateLimiter(rate) {
        if (rate && rate.options && typeof rate.options == "object") {
            if (typeof rate.idGetter === "function") {
                this.#rateLimiterIdGetter = rate.idGetter;
            }
            if (rate.exception) {
                this.#rateLimiterException = rate.exception;
            }
            if (rate.client && typeof rate.client === "string") {
                this.#rateLimiterClientName = rate.client;
            }
            this.#rateLimiter = InitRateLimiter.initCustom(
                rate.options,
                this.#rateLimiterClientName
            );
        }
    }

    async #checkRate(envs) {
        try {
            this.#rateLimiter &&
                (await this.#rateLimiter.consume(
                    this.#rateLimiterIdGetter(envs)
                ));
        } catch {
            throw new this.#rateLimiterException(envs);
        }
    }
}

module.exports = Form;

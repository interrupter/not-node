const validator = require("validator");

const FormFabric = require("./fabric");

const { createSchemaFromFields } = require("../fields");

const { objHas, isFunc, firstLetterToUpper } = require("../common");

const ValidationBuilder = require("not-validation").Builder;
const ValidationSession = require("not-validation").Session;

const notValidationError = require("not-error/src/validation.error.node.cjs");
const notError = require("not-error/src/error.node.cjs");

const {
    FormExceptionExtractorForFieldIsUndefined,
    FormExceptionTransformerForFieldIsUndefined,
} = require("../exceptions/form.js");

const DEFAULT_EXTRACTORS = require("./extractors");
const DEFAULT_ID_EXTRACTORS = require("./env_extractors");
const DEFAULT_TRANSFORMERS = require("./transformers");

/**
 * Generic form validation class
 **/
class Form {
    /**
     * @prop {import('not-validation/src/builder').notValidationSchema} validation schema
     **/
    #SCHEMA = {
        fields: {},
        form: [],
        forms: {},
    };
    /**
     * @prop {string} name of form
     **/
    #FORM_NAME;
    #MODEL_NAME;
    #MODULE_NAME;
    #PROTO_FIELDS;
    #VALIDATOR;
    #EXTRACTORS = {
        ...DEFAULT_EXTRACTORS,
    };

    #ENV_EXTRACTORS = {
        ...DEFAULT_ID_EXTRACTORS,
    };

    #TRANSFORMERS = {
        ...DEFAULT_TRANSFORMERS,
    };

    constructor({
        FIELDS,
        FORM_NAME,
        MODEL_NAME,
        MODULE_NAME,
        app,
        EXTRACTORS = {},
        ENV_EXTRACTORS = {},
        TRANSFORMERS = {},
    }) {
        this.#FORM_NAME = FORM_NAME;
        this.#MODEL_NAME = MODEL_NAME;
        this.#MODULE_NAME = MODULE_NAME;
        this.#PROTO_FIELDS = FIELDS;
        this.#createValidationSchema(app);
        this.#augmentValidationSchema();
        this.#addExtractors(EXTRACTORS);
        this.#addEnvExtractors(ENV_EXTRACTORS);
        this.#addTransformers(TRANSFORMERS);
    }

    /**
     *
     *
     * @param {import('../types').notNodeExpressRequest} req
     * @return {*}
     * @memberof Form
     */
    getModelName(req) {
        if (this.#MODEL_NAME) {
            return this.#MODEL_NAME;
        } else if (req) {
            return firstLetterToUpper(req.notRouteData.modelName);
        }
        return undefined;
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
        await this.#_validate(data);
        return data;
    }

    /**
     * Extracts data, should be overriden
     * @param {import('../types').notNodeExpressRequest} req expressjs request object
     * @return {Promise<import('../types').PreparedData>}        forma data
     **/
    async extract(req) {
        return this.afterExtract(
            {
                ...this.extractRequestEnvs(req),
                data: this.extractByInstructionsFromRouteActionFields(req),
            },
            req
        );
    }

    /**
     * Chance to edit prepared data
     *
     * @param {import('../types').PreparedData}             value
     * @param {import('../types').notNodeExpressRequest}    [req]
     * @return {Promise<import('../types').PreparedData>}
     */
    //eslint-disable-next-line no-unused-vars
    async afterExtract(value, req) {
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
                    "not-core:form_validation_error",
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
                    "not-core:form_validation_unknown_error",
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
                    "core:form_validation_error",
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

    #addExtractors(extractors = {}) {
        if (extractors) {
            this.#EXTRACTORS = { ...this.#EXTRACTORS, ...extractors };
        }
    }

    extractByInstructions(req, instructions) {
        const results = {};
        for (let fieldName in instructions) {
            const instruction = instructions[fieldName];
            if (Array.isArray(instruction)) {
                this.#extractByInstructionPipe({
                    results,
                    instructions: instruction,
                    fieldName,
                    req,
                });
            } else {
                this.#extractByInstruction({
                    results,
                    instruction,
                    fieldName,
                    req,
                });
            }
        }
        return results;
    }

    #extractByInstruction({ results, instruction, fieldName, req }) {
        if (isFunc(instruction)) {
            results[fieldName] = instruction(req, fieldName);
        } else if (typeof instruction == "string") {
            const extractor = this.#EXTRACTORS[instruction];
            if (isFunc(extractor)) {
                results[fieldName] = extractor(req, fieldName);
            } else {
                throw new FormExceptionExtractorForFieldIsUndefined(fieldName);
            }
        }
    }

    #extractByInstructionPipe({ results, instructions, fieldName, req }) {
        if (!instructions || instructions.length === 0) {
            throw new FormExceptionExtractorForFieldIsUndefined(fieldName);
        }
        //
        this.#extractByInstruction({
            results,
            instruction: instructions[0],
            fieldName,
            req,
        });
        for (let t = 1; t < instructions.length; t++) {
            const instruction = instructions[t];
            this.#transformByInstruction({
                results,
                instruction,
                fieldName,
            });
        }
    }

    #transformByInstruction({ results, instruction, fieldName }) {
        if (isFunc(instruction)) {
            results[fieldName] = instruction(results[fieldName]);
        } else if (typeof instruction == "string") {
            const transformer = this.#TRANSFORMERS[instruction];
            if (isFunc(transformer)) {
                results[fieldName] = transformer(results[fieldName]);
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
     * @returns {Array<string>|Array<Array<string>>}
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

    createInstructionFromRouteActionFields(
        req,
        mainInstruction = ["fromBody", "xss"],
        exceptions = {}
    ) {
        const result = {};
        const fields = this.extractActionFieldsFromRequest(req);
        fields.forEach((fieldName) => {
            if (objHas(exceptions, fieldName)) {
                result[fieldName] = exceptions[fieldName];
            } else {
                result[fieldName] = mainInstruction;
            }
        });
        return result;
    }

    /**
     *
     * @param {import('express').Request}   req
     * @param {Array<string>}               mainInstruction
     * @param {object}                      exceptions
     * @returns
     */
    extractByInstructionsFromRouteActionFields(
        req,
        mainInstruction = ["fromBody", "xss"],
        exceptions = {}
    ) {
        const instructions = this.createInstructionFromRouteActionFields(
            req,
            mainInstruction,
            exceptions
        );
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
}

module.exports = Form;

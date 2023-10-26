const notRequestError = require("not-error/src/request.error.node.cjs");
class FormExceptionExtractorForFieldIsUndefined extends notRequestError {
    constructor(fieldName) {
        super("not-node:form_exception_field_extractor_is_undefined", {
            fieldName,
        });
    }
}

module.exports.FormExceptionExtractorForFieldIsUndefined =
    FormExceptionExtractorForFieldIsUndefined;

class FormExceptionTransformerForFieldIsUndefined extends notRequestError {
    constructor(fieldName, instruction) {
        super("not-node:form_exception_field_transformer_is_undefined", {
            fieldName,
            instruction,
        });
    }
}

module.exports.FormExceptionTransformerForFieldIsUndefined =
    FormExceptionTransformerForFieldIsUndefined;

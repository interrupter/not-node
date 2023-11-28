const notRequestError = require("not-error/src/request.error.node.cjs");
const { HttpExceptionTooManyRequests } = require("./http");
class FormExceptionExtractorForFieldIsUndefined extends notRequestError {
    constructor(fieldName) {
        super("not-node:form_exception_field_extractor_is_undefined", {
            params: { fieldName },
        });
    }
}

module.exports.FormExceptionExtractorForFieldIsUndefined =
    FormExceptionExtractorForFieldIsUndefined;

class FormExceptionTransformerForFieldIsUndefined extends notRequestError {
    constructor(fieldName, instruction) {
        super("not-node:form_exception_field_transformer_is_undefined", {
            params: {
                fieldName,
                instruction,
            },
        });
    }
}

module.exports.FormExceptionTransformerForFieldIsUndefined =
    FormExceptionTransformerForFieldIsUndefined;

class FormExceptionTooManyRequests extends HttpExceptionTooManyRequests {
    constructor(formData) {
        super({
            ip: formData.identity.ip,
        });
    }
}

module.exports.FormExceptionTooManyRequests = FormExceptionTooManyRequests;

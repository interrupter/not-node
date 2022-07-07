const { notRequestError } = require("not-error");
class FormExceptionExtractorForFieldIsUndefined extends notRequestError {
    constructor(fieldName) {
        super("not-node:form_exception_field_extractor_is_undefined", {
            fieldName,
        });
    }
}

module.exports.FormExceptionExtractorForFieldIsUndefined =
    FormExceptionExtractorForFieldIsUndefined;

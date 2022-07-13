const { notError } = require("not-error");

class VersioningExceptionSameOldData extends notError {
    constructor() {
        super("not-node:versioning_error_same_old_data");
    }
}
module.exports.VersioningExceptionSameOldData = VersioningExceptionSameOldData;

class VersioningExceptioNoPreviousVersions extends notError {
    constructor() {
        super("not-node:versioning_error_no_previous_versions");
    }
}
module.exports.VersioningExceptioNoPreviousVersions =
    VersioningExceptioNoPreviousVersions;

class IncrementExceptionIDGeneratorRebaseFailed extends notError {
    constructor() {
        super("not-node:increment_id_generator_rebase_failed");
    }
}
module.exports.IncrementExceptionIDGeneratorRebaseFailed =
    IncrementExceptionIDGeneratorRebaseFailed;

class IncrementExceptionIDGenerationFailed extends notError {
    constructor() {
        super("not-node:increment_id_generation_failed");
    }
}
module.exports.IncrementExceptionIDGenerationFailed =
    IncrementExceptionIDGenerationFailed;

class IncrementExceptionFieldsNotExistInDataObject extends notError {
    constructor(miss) {
        super("not-node:increment_fields_not_exist_in_data_object", { miss });
    }
}
module.exports.IncrementExceptionFieldsNotExistInDataObject =
    IncrementExceptionFieldsNotExistInDataObject;

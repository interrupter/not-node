const { notError } = require("not-error/src");

class VersioningExceptionSameOldData extends notError {
    constructor() {
        super("not-node:versioning_error_same_old_data");
    }
}
module.exports.VersioningExceptionSameOldData = VersioningExceptionSameOldData;

class VersioningExceptionNoPreviousVersions extends notError {
    constructor() {
        super("not-node:versioning_error_no_previous_versions");
    }
}
module.exports.VersioningExceptionNoPreviousVersions =
    VersioningExceptionNoPreviousVersions;

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

const { notError } = require("not-error");

class IdentityExceptionProviderAlreadySet extends notError {
    constructor(name) {
        super("not-node:identity_provider_already_set", { name });
    }
}
module.exports.IdentityExceptionProviderAlreadySet =
    IdentityExceptionProviderAlreadySet;

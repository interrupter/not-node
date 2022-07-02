const { notError } = require("not-error");

class RolesExceptionRoleSetIsNotValid extends notError {
    constructor(name) {
        super("not-node:auth_roles_role_set_is_not_valid", { name });
    }
}
module.exports.RolesExceptionRoleSetIsNotValid =
    RolesExceptionRoleSetIsNotValid;

class RolesExceptionNoRolesSupremacyOrder extends notError {
    constructor() {
        super("not-node:auth_roles_no_roles_supremacy_order");
    }
}

module.exports.RolesExceptionNoRolesSupremacyOrder =
    RolesExceptionNoRolesSupremacyOrder;

class RolesExceptionSupremacyOrderElementIsNotAString extends notError {
    constructor() {
        super("not-node:auth_roles_supremacy_order_element_is_not_a_string");
    }
}

module.exports.RolesExceptionSupremacyOrderElementIsNotAString =
    RolesExceptionSupremacyOrderElementIsNotAString;

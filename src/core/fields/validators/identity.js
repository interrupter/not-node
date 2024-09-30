const { objHas } = require("../../../common");

module.exports = [
    {
        validator(val) {
            return objHas(val, "root") && typeof val.root == "boolean";
        },
        message: "not-node:identity_field_root_is_not_valid",
    },
    {
        validator(val) {
            return objHas(val, "admin") && typeof val.admin == "boolean";
        },
        message: "not-node:identity_field_admin_is_not_valid",
    },
    {
        validator(val) {
            return objHas(val, "auth") && typeof val.auth == "boolean";
        },
        message: "not-node:identity_field_auth_is_not_valid",
    },
    {
        validator(val) {
            return (
                objHas(val, "role") &&
                (typeof val.role === "string" || Array.isArray(val.role))
            );
        },
        message: "not-node:identity_field_role_is_not_valid",
    },
    {
        validator(val) {
            return (
                objHas(val, "primaryRole") &&
                typeof val.primaryRole === "string"
            );
        },
        message: "not-node:identity_field_primaryRole_is_not_valid",
    },
    {
        validator(val) {
            return objHas(val, "uid");
        },
        message: "not-node:identity_field_uid_is_undefined",
    },
    {
        validator(val) {
            return objHas(val, "sid");
        },
        message: "not-node:identity_field_sid_is_undefined",
    },
    {
        validator(val, { validator }) {
            return (
                objHas(val, "ip") &&
                typeof val.ip === "string" &&
                validator.isIP(val.ip)
            );
        },
        message: "not-node:identity_field_ip_is_not_valid",
    },
    {
        validator(val) {
            return objHas(val, "provider") && typeof val.provider === "string";
        },
        message: "not-node:identity_field_provider_is_not_valid",
    },
];

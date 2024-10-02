//const { objHas } = require("../../common");
const {
    DEFAULT_USER_ROLE_FOR_ROOT,
    DEFAULT_USER_ROLE_FOR_ADMIN,
    DEFAULT_USER_ROLE_FOR_GUEST,
} = require("../../auth/const");
const notValidationError = require("not-error/src/validation.error.node.cjs");

const schema = {
    type: "object",
    properties: {
        root: { type: "boolean" },
        admin: { type: "boolean" },
        auth: { type: "boolean" },
        role: {
            type: "array",
            items: { type: "string" },
        },
        primaryRole: {
            type: "string",
            enum: ["root", "admin", "client", "user", "guest"],
        },
        uid: { type: "string" },
        sid: { type: "string" },
        ip: { type: "string" },
        provider: { type: "string" },
    },
    required: [
        "root",
        "admin",
        "auth",
        "role",
        "primaryRole",
        "uid",
        "sid",
        "provider",
    ],
};

module.exports = [
    {
        validator(val, { ajv }) {
            const validate = ajv.compile(schema);
            if (validate(val)) {
                return true;
            } else {
                const fields = {};
                validate.errors.forEach((error) => {
                    const propName = error.instancePath.replaceAll("/", ".");
                    fields[propName] = [error.message];
                });
                throw new notValidationError(
                    "not-node:identity_object_is_not_valid",
                    fields
                );
            }
        },
    },
    {
        validator(val) {
            const superuser = val.root || val.admin;
            if (superuser) {
                return val.auth;
            }
            return true;
        },
        message: "not-node:identity_root_and_admin_should_be_auth",
    },
    {
        validator(val) {
            return !(val.admin && val.root);
        },
        message: "not-node:identity_root_and_admin_cant_be_both_true",
    },
    {
        validator(val) {
            if (val.root) {
                return val.primaryRole === DEFAULT_USER_ROLE_FOR_ROOT;
            }
            return true;
        },
        message: "not-node:identity_root_should_have_primaryRole_root",
    },
    {
        validator(val) {
            if (val.admin) {
                return val.primaryRole === DEFAULT_USER_ROLE_FOR_ADMIN;
            } else {
                return true;
            }
        },
        message: "not-node:identity_admin_should_have_primaryRole_admin",
    },
    {
        validator(val) {
            if (!val.auth) {
                return val.primaryRole === DEFAULT_USER_ROLE_FOR_GUEST;
            }
            return true;
        },
        message: "not-node:identity_guest_should_have_primaryRole_guest",
    },

    {
        validator(val) {
            return val.role.includes(val.primaryRole);
        },
        message: "not-node:identity_role_should_contain_primaryRole",
    },
];

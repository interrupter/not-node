/** @type {string} system administrator, cant change system's content */
const DEFAULT_USER_ROLE_FOR_ROOT = "root";
/** @type {string} content administrator, cant change system's configuration */
const DEFAULT_USER_ROLE_FOR_ADMIN = "admin";
/** @type {string} unknown user */
const DEFAULT_USER_ROLE_FOR_GUEST = "guest";

const ACTION_SIGNATURE_CREATE = "create";
const ACTION_SIGNATURE_READ = "read";
const ACTION_SIGNATURE_UPDATE = "update";
const ACTION_SIGNATURE_DELETE = "delete";
const ACTION_SIGNATURE_ANY = "any";

const ACTION_SIGNATURES = {
    CREATE: ACTION_SIGNATURE_CREATE,
    READ: ACTION_SIGNATURE_READ,
    UPDATE: ACTION_SIGNATURE_UPDATE,
    DELETE: ACTION_SIGNATURE_DELETE,
    ANY: ACTION_SIGNATURE_ANY,
};

const OBJECT_STRING = "[object String]";

const DOCUMENT_OWNER_FIELD_NAME = "owner";
const TOKEN_TTL = 3600;

module.exports = {
    TOKEN_TTL,
    OBJECT_STRING,
    DEFAULT_USER_ROLE_FOR_GUEST,
    DEFAULT_USER_ROLE_FOR_ROOT,
    DEFAULT_USER_ROLE_FOR_ADMIN,
    DOCUMENT_OWNER_FIELD_NAME,
    ACTION_SIGNATURES,
};
